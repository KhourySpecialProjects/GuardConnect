import { z } from "zod";

export const menteeSchema = z.object({
  menteeId: z.number().int().positive(),
  userId: z.string(),
  learningGoals: z.string().nullable().optional(),
  experienceLevel: z.string().nullable().optional(),
  preferredMentorType: z.string().nullable().optional(),
  status: z.enum(["active", "inactive", "matched"]),
  resumeFileId: z.string().uuid().nullable().optional(),
  personalInterests: z.string().nullable().optional(),
  roleModelInspiration: z.string().nullable().optional(),
  hopeToGainResponses: z.array(z.string()).nullable().optional(),
  mentorQualities: z.array(z.string()).nullable().optional(),
  preferredMeetingFormat: z
    .enum(["in-person", "virtual", "hybrid", "no-preference"])
    .nullable()
    .optional(),
  hoursPerMonthCommitment: z.number().int().positive().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type MenteeSchema = z.infer<typeof menteeSchema>;

export const createMenteeInputSchema = z.object({
  userId: z.string(),
  learningGoals: z.string().optional(),
  experienceLevel: z.string().optional(),
  preferredMentorType: z.string().optional(),
  status: z
    .enum(["active", "inactive", "matched"])
    .optional()
    .default("active"),
  resumeFileId: z.string().uuid().optional(),
  personalInterests: z.string().optional(),
  roleModelInspiration: z.string().optional(),
  hopeToGainResponses: z.array(z.string()).optional(),
  mentorQualities: z.array(z.string()).optional(),
  preferredMeetingFormat: z
    .enum(["in-person", "virtual", "hybrid", "no-preference"])
    .optional(),
  hoursPerMonthCommitment: z.number().int().positive().optional(),
});

export const updateMenteeInputSchema = z.object({
  menteeId: z.number().int().positive(),
  learningGoals: z.string().optional(),
  experienceLevel: z.string().optional(),
  preferredMentorType: z.string().optional(),
  status: z.enum(["active", "inactive", "matched"]).optional(),
});

export const getMenteeInputSchema = z.object({
  menteeId: z.number().int().positive(),
});

export const getMenteesByUserInputSchema = z.object({
  userId: z.string(),
});

export type CreateMenteeInput = z.infer<typeof createMenteeInputSchema>;
export type UpdateMenteeInput = z.infer<typeof updateMenteeInputSchema>;
export type GetMenteeInput = z.infer<typeof getMenteeInputSchema>;
export type GetMenteesByUserInput = z.infer<typeof getMenteesByUserInputSchema>;

export type CreateMenteeOutput = {
  menteeId: number;
  userId: string;
  learningGoals?: string | null;
  experienceLevel?: string | null;
  preferredMentorType?: string | null;
  status: "active" | "inactive" | "matched";
  resumeFileId?: string | null;
  personalInterests?: string | null;
  roleModelInspiration?: string | null;
  hopeToGainResponses?: string[] | null;
  mentorQualities?: string[] | null;
  preferredMeetingFormat?:
    | "in-person"
    | "virtual"
    | "hybrid"
    | "no-preference"
    | null;
  hoursPerMonthCommitment?: number | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export const getMenteeOutputSchema = z.object({
  menteeId: z.number(),
  userId: z.string(),
  learningGoals: z.string().nullish(),
  experienceLevel: z.string().nullish(),
  preferredMentorType: z.string().nullish(),
  status: z.enum(["active", "inactive", "matched"]),
  resumeFileId: z.string().nullish(),
  personalInterests: z.string().nullish(),
  roleModelInspiration: z.string().nullish(),
  hopeToGainResponses: z.array(z.string()).nullish(),
  mentorQualities: z.array(z.string()).nullish(),
  preferredMeetingFormat: z
    .enum(["in-person", "virtual", "hybrid", "no-preference"])
    .nullish(),
  hoursPerMonthCommitment: z.number().nullish(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),

  /**
   * Enriched user profile fields for mentorship UI.
   * These are joined from the associated `users` record.
   */
  name: z.string().nullish(),
  email: z.string().nullish(),
  phoneNumber: z.string().nullish(),
  imageFileId: z.string().nullish(),
  rank: z.string().nullish(),
  positionType: z.string().nullish(),
  detailedPosition: z.string().nullish(),
  detailedRank: z.string().nullish(),
  location: z.string().nullish(),
});

export type GetMenteeOutput = z.infer<typeof getMenteeOutputSchema>;

export type UpdateMenteeOutput = {
  menteeId: number;
  userId: string;
  learningGoals?: string | null;
  experienceLevel?: string | null;
  preferredMentorType?: string | null;
  status: "active" | "inactive" | "matched";
  resumeFileId?: string | null;
  personalInterests?: string | null;
  roleModelInspiration?: string | null;
  hopeToGainResponses?: string[] | null;
  mentorQualities?: string[] | null;
  preferredMeetingFormat?:
    | "in-person"
    | "virtual"
    | "hybrid"
    | "no-preference"
    | null;
  hoursPerMonthCommitment?: number | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};
