import z from "zod";
import { AuthRepository } from "../data/repository/auth-repo.js";
import { InviteCodeRepository } from "../data/repository/invite-code-repo.js";
import { GLOBAL_CREATE_INVITE_KEY } from "../data/roles.js";
import { InviteCodeService } from "../service/invite-code-service.js";
import { withErrorHandling } from "../trpc/error_handler.js";
import { procedure, roleProcedure, router } from "../trpc/trpc.js";
import {
  createInviteCodeInputSchema,
  createInviteCodeOutputSchema,
  listInviteCodesInputSchema,
  listInviteCodesOutputSchema,
  revokeInviteCodeInputSchema,
  validateInviteCodeInputSchema,
  validateInviteCodeOutputSchema,
} from "../types/invite-code-types.js";

const inviteCodeService = new InviteCodeService(
  new InviteCodeRepository(),
  new AuthRepository(),
);

const inviteProcedure = roleProcedure([GLOBAL_CREATE_INVITE_KEY]);

/**
 * Create a new invite code (requires global:create-invite permission)
 */
const createInviteCode = inviteProcedure
  .input(createInviteCodeInputSchema)
  .output(createInviteCodeOutputSchema)
  .meta({
    openapi: {
      method: "POST",
      path: "/inviteCodes.createInviteCode",
      summary: "Create a new invite code with specified role permissions",
      tags: ["Invite Codes"],
    },
  })
  .mutation(async ({ ctx, input }) => {
    return withErrorHandling("createInviteCode", async () => {
      const adminUserId = ctx.auth.user.id;
      return await inviteCodeService.createInvite(
        adminUserId,
        input.roleKeys,
        input.expiresInHours,
      );
    });
  });

/**
 * Validate an invite code (public endpoint for sign-up flow)
 */
const validateInviteCode = procedure
  .input(validateInviteCodeInputSchema)
  .output(validateInviteCodeOutputSchema)
  .meta({
    openapi: {
      method: "POST",
      path: "/inviteCodes.validateInviteCode",
      summary:
        "Validate an invite code and return its role assignments if valid. Public endpoint.",
      tags: ["Invite Codes"],
    },
  })
  .query(async ({ input }) => {
    return withErrorHandling("validateInviteCode", async () => {
      return await inviteCodeService.validateInviteCode(input.code);
    });
  });

/**
 * List all invite codes with optional filtering (requires global:create-invite permission)
 */
const listInviteCodes = inviteProcedure
  .input(listInviteCodesInputSchema)
  .output(listInviteCodesOutputSchema)
  .meta({
    openapi: {
      method: "POST",
      path: "/inviteCodes.listInviteCodes",
      summary:
        "List all invite codes with optional status filtering and pagination. Requires global:create-invite permission.",
      tags: ["Invite Codes"],
    },
  })
  .query(async ({ ctx, input }) => {
    return withErrorHandling("listInviteCodes", async () => {
      const adminUserId = ctx.auth.user.id;
      return await inviteCodeService.listInviteCodes(
        adminUserId,
        input.status,
        input.limit,
        input.offset,
      );
    });
  });

/**
 * Revoke an invite code (requires global:create-invite permission)
 */
const revokeInviteCode = inviteProcedure
  .input(revokeInviteCodeInputSchema)
  .output(z.void())
  .meta({
    openapi: {
      method: "POST",
      path: "/inviteCodes.revokeInviteCode",
      summary:
        "Revoke an invite code, preventing its use. Requires global:create-invite permission.",
      tags: ["Invite Codes"],
    },
  })
  .mutation(async ({ ctx, input }) => {
    return withErrorHandling("revokeInviteCode", async () => {
      const adminUserId = ctx.auth.user.id;
      return await inviteCodeService.revokeInvite(adminUserId, input.codeId);
    });
  });

export const inviteCodeRouter = router({
  createInviteCode,
  validateInviteCode,
  listInviteCodes,
  revokeInviteCode,
});
