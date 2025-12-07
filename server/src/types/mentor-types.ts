import { z } from "zod";

export const mentorSchema = z.object({
  mentorId: z.number().int().positive(),
  userId: z.string(),
  mentorshipPreferences: z.string().nullable().optional(),
  yearsOfService: z.number().int().nonnegative().nullable().optional(),
  eligibilityData: z.record(z.string(), z.unknown()).nullable().nullish(),
  status: z.enum(["requested", "approved", "active"]),
  resumeFileId: z.string().uuid().nullable().optional(),
  strengths: z.array(z.string()).default([]),
  personalInterests: z.string().nullable().optional(),
  whyInterestedResponses: z.array(z.string()).nullable().optional(),
  careerAdvice: z.string().nullable().optional(),
  preferredMenteeCareerStages: z
    .array(
      z.enum([
        "new-soldiers",
        "junior-ncos",
        "senior-ncos",
        "junior-officers",
        "senior-officers",
        "transitioning",
        "no-preference",
      ]),
    )
    .nullable()
    .optional(),
  preferredMeetingFormat: z
    .enum(["in-person", "virtual", "hybrid", "no-preference"])
    .nullable()
    .optional(),
  hoursPerMonthCommitment: z.number().int().positive().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type MentorSchema = z.infer<typeof mentorSchema>;

export const createMentorInputSchema = z.object({
  userId: z.string(),
  mentorshipPreferences: z.string().optional(),
  yearsOfService: z.number().int().nonnegative().optional(),
  eligibilityData: z.record(z.string(), z.unknown()).nullish(),
  status: z
    .enum(["requested", "approved", "active"])
    .optional()
    .default("requested"),
  resumeFileId: z.string().uuid().optional(),
  strengths: z.array(z.string()).max(5).optional().default([]),
  personalInterests: z.string().optional(),
  whyInterestedResponses: z.array(z.string()).optional(),
  careerAdvice: z.string().optional(),
  preferredMenteeCareerStages: z
    .array(
      z.enum([
        "new-soldiers",
        "junior-ncos",
        "senior-ncos",
        "junior-officers",
        "senior-officers",
        "transitioning",
        "no-preference",
      ]),
    )
    .optional(),
  preferredMeetingFormat: z
    .enum(["in-person", "virtual", "hybrid", "no-preference"])
    .optional(),
  hoursPerMonthCommitment: z.number().int().positive().optional(),
});

export type CreateMentorInput = z.infer<typeof createMentorInputSchema>;

export const createMentorOutputSchema = z.object({
  mentorId: z.number(),
  userId: z.string(),
  mentorshipPreferences: z.string().nullish(),
  yearsOfService: z.number().nullish(),
  eligibilityData: z.record(z.string(), z.unknown()).nullish(),
  status: z.enum(["requested", "approved", "active"]),
  resumeFileId: z.string().nullish(),
  strengths: z.array(z.string()).nullish(),
  personalInterests: z.string().nullish(),
  whyInterestedResponses: z.array(z.string()).nullish(),
  careerAdvice: z.string().nullish(),
  preferredMenteeCareerStages: z.array(z.string()).nullish(),
  preferredMeetingFormat: z
    .enum(["in-person", "virtual", "hybrid", "no-preference"])
    .nullish(),
  hoursPerMonthCommitment: z.number().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CreateMentorOutput = z.infer<typeof createMentorOutputSchema>;

export const getMentorOutputSchema = z.object({
  mentorId: z.number(),
  userId: z.string(),
  mentorshipPreferences: z.string().nullish(),
  yearsOfService: z.number().nullish(),
  eligibilityData: z.record(z.string(), z.unknown()).nullish(),
  status: z.enum(["requested", "approved", "active"]),
  resumeFileId: z.string().nullish(),
  strengths: z.array(z.string()).nullish(),
  personalInterests: z.string().nullish(),
  whyInterestedResponses: z.array(z.string()).nullish(),
  careerAdvice: z.string().nullish(),
  preferredMenteeCareerStages: z.array(z.string()).nullish(),
  preferredMeetingFormat: z
    .enum(["in-person", "virtual", "hybrid", "no-preference"])
    .nullish(),
  hoursPerMonthCommitment: z.number().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),

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

export type GetMentorOutput = z.infer<typeof getMentorOutputSchema>;
