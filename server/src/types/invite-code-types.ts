import { z } from "zod";
import { roleKeysArraySchema } from "../data/roles.js";

// Input schema for creating an invite code
export const createInviteCodeInputSchema = z.object({
  roleKeys: roleKeysArraySchema,
  expiresInHours: z.number().positive().optional(),
});

export const createInviteCodeOutputSchema = z.object({
  codeId: z.number(),
  code: z.string(),
  roleKeys: roleKeysArraySchema,
  expiresAt: z.date(),
});

// Input schema for validating an invite code
export const validateInviteCodeInputSchema = z.object({
  code: z
    .string()
    .min(8, "Invite code must be at least 8 characters")
    .max(8, "Invite code must be exactly 8 characters")
    .regex(
      /^[A-Z0-9]+$/,
      "Invite code must contain only uppercase letters and numbers",
    ),
});

export const validateInviteCodeOutputSchema = z.discriminatedUnion("isValid", [
  z.object({ isValid: z.literal(true), roleKeys: roleKeysArraySchema }),
  z.object({ isValid: z.literal(false), message: z.string() }),
]);

// Input schema for listing invite codes with filters
export const inviteCodeStatusEnum = z.enum([
  "active",
  "used",
  "expired",
  "revoked",
]);

export const listInviteCodesInputSchema = z.object({
  status: inviteCodeStatusEnum.optional(),
  limit: z.number().int().positive().max(100).optional().default(50),
  offset: z.number().int().nonnegative().optional().default(0),
});

export const listInviteCodesOutputSchema = z.object({
  data: z.array(
    z.object({
      status: inviteCodeStatusEnum,
      createdAt: z.date(),
      expiresAt: z.date(),
      code: z.string(),
      roleKeys: roleKeysArraySchema,
      codeId: z.number(),
      createdBy: z.string(),
      usedBy: z.string().nullable(),
      usedAt: z.date().nullable(),
      revokedBy: z.string().nullable(),
      revokedAt: z.date().nullable(),
    }),
  ),
  totalCount: z.number(),
  hasMore: z.boolean(),
  hasPrevious: z.boolean(),
});

export type InviteCodeStatus = z.infer<typeof inviteCodeStatusEnum>;

// Input schema for revoking an invite code
export const revokeInviteCodeInputSchema = z.object({
  codeId: z.number().int().positive(),
});
