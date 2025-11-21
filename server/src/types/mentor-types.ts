import { z } from "zod";

export const mentorSchema = z.object({
  mentorId: z.number().int().positive(),
  userId: z.string(),
  mentorshipPreferences: z.string().nullable().optional(),
  rank: z.string().nullable().optional(),
  yearsOfService: z.number().int().nonnegative().nullable().optional(),
  eligibilityData: z.record(z.string(), z.unknown()).nullable().nullish(),
  status: z.enum(["requested", "approved", "active"]),
  positionType: z.enum(["active", "guard", "reserve"]).nullable().optional(),
  serviceType: z.enum(["enlisted", "officer"]).nullable().optional(),
  detailedPosition: z.string().nullable().optional(),
  detailedRank: z.string().nullable().optional(),
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
  rank: z.string().optional(),
  yearsOfService: z.number().int().nonnegative().optional(),
  eligibilityData: z.record(z.string(), z.unknown()).nullish(),
  status: z
    .enum(["requested", "approved", "active"])
    .optional()
    .default("requested"),
  positionType: z.enum(["active", "guard", "reserve"]).optional(),
  serviceType: z.enum(["enlisted", "officer"]).optional(),
  detailedPosition: z.string().optional(),
  detailedRank: z.string().optional(),
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

export type CreateMentorOutput = {
  mentorId: number;
  userId: string;
  mentorshipPreferences?: string | null;
  rank?: string | null;
  yearsOfService?: number | null;
  eligibilityData?: Record<string, unknown> | null;
  status: "requested" | "approved" | "active";
  positionType?: "active" | "guard" | "reserve" | null;
  serviceType?: "enlisted" | "officer" | null;
  detailedPosition?: string | null;
  detailedRank?: string | null;
  resumeFileId?: string | null;
  strengths?: string[];
  personalInterests?: string | null;
  whyInterestedResponses?: string[] | null;
  careerAdvice?: string | null;
  preferredMenteeCareerStages?: string[] | null;
  preferredMeetingFormat?:
    | "in-person"
    | "virtual"
    | "hybrid"
    | "no-preference"
    | null;
  hoursPerMonthCommitment?: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type GetMentorOutput = {
  mentorId: number;
  userId: string;
  mentorshipPreferences?: string | null;
  rank?: string | null;
  yearsOfService?: number | null;
  eligibilityData?: Record<string, unknown> | null;
  status: "requested" | "approved" | "active";
  positionType?: "active" | "guard" | "reserve" | null;
  serviceType?: "enlisted" | "officer" | null;
  detailedPosition?: string | null;
  detailedRank?: string | null;
  resumeFileId?: string | null;
  strengths?: string[];
  personalInterests?: string | null;
  whyInterestedResponses?: string[] | null;
  careerAdvice?: string | null;
  preferredMenteeCareerStages?: string[] | null;
  preferredMeetingFormat?:
    | "in-person"
    | "virtual"
    | "hybrid"
    | "no-preference"
    | null;
  hoursPerMonthCommitment?: number | null;
  createdAt: Date;
  updatedAt: Date;
};
