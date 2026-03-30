import { z } from "zod";
import {
  type GetMenteeOutput,
  getMenteeOutputSchema,
} from "../types/mentee-types.js";
import {
  type GetMentorOutput,
  getMentorOutputSchema,
} from "../types/mentor-types.js";

const matchStatusSchema = z.enum(["pending", "accepted", "declined"]);

type MatchStatus = z.infer<typeof matchStatusSchema>;

export type MentorshipMatch = {
  matchId: number;
  requestorUserId: string;
  mentorUserId: string;
  status: MatchStatus;
  matchedAt: string | Date;
  message?: string; // Optional personalized message from mentee to mentor
};

const suggestedMentorSchema = z.object({
  mentor: getMentorOutputSchema,
  status: z.enum(["active", "pending", "suggested"]),
  hasRequested: z.boolean().optional(),
});

// For mentee's "Your Mentor" section
export type SuggestedMentor = z.infer<typeof suggestedMentorSchema>;

export type MatchedMentor = {
  mentor: GetMentorOutput;
  matchId: number;
  status: MatchStatus;
  matchedAt: string | Date;
};

export const pendingMenteeRequestSchema = z.object({
  mentee: getMenteeOutputSchema,
  matchId: z.number(),
  status: matchStatusSchema,
  matchedAt: z.union([z.string(), z.date()]),
});

// For mentor's "Your Mentee" section
export type PendingMenteeRequest = {
  mentee: GetMenteeOutput;
  matchId: number;
  status: MatchStatus;
  matchedAt: string | Date;
};

export type PendingMentorRequest = {
  mentor: GetMentorOutput;
  matchId: number;
  status: MatchStatus;
  matchedAt: string | Date;
};

export type MatchedMentee = {
  mentee: GetMenteeOutput;
  matchId: number;
  status: MatchStatus;
  matchedAt: string | Date;
};

/**
 * Aggregated mentorship data returned to the frontend.
 *
 * NOTE: `GetMentorOutput` and `GetMenteeOutput` now include selected fields
 * from the associated `users` record (name, contact, rank/position, image,
 * location). Callers can rely on those fields being present when a user
 * profile exists, without making additional user API calls.
 */
export const mentorshipDataOutputSchema = z.object({
  mentor: z
    .object({
      activeMentees: z.array(getMenteeOutputSchema),
      pendingRequests: z.array(pendingMenteeRequestSchema),
      profile: getMentorOutputSchema.nullable(),
    })
    .nullable(),
  mentee: z
    .object({
      mentorRecommendations: z.array(suggestedMentorSchema),
      activeMentors: z.array(getMentorOutputSchema),
      profile: getMenteeOutputSchema.nullable(),
    })
    .nullable(),
});

export type MentorshipDataOutput = z.infer<typeof mentorshipDataOutputSchema>;

export const getMentorshipDataInputSchema = z.object({
  userId: z.string(),
});

export type GetMentorshipDataInput = z.infer<
  typeof getMentorshipDataInputSchema
>;

export const updateOptInInputSchema = z.object({
  role: z.enum(["mentor", "mentee"]),
  isAccepting: z.boolean(),
});

export type UpdateOptInInput = z.infer<typeof updateOptInInputSchema>;

export const mentorshipAdminStatsOutputSchema = z.object({
  mentors: z.object({
    requested: z.number(),
    approved: z.number(),
    active: z.number(),
    total: z.number(),
    acceptingNewMatches: z.number(),
  }),
  mentees: z.object({
    active: z.number(),
    inactive: z.number(),
    matched: z.number(),
    total: z.number(),
  }),
  matches: z.object({
    pending: z.number(),
    accepted: z.number(),
    declined: z.number(),
    total: z.number(),
    declineRate: z.number(),
  }),
});

export type MentorshipAdminStatsOutput = z.infer<
  typeof mentorshipAdminStatsOutputSchema
>;

export const getPendingMentorsInputSchema = z.object({
  status: z.enum(["requested", "approved", "active"]).default("requested"),
});

export type GetPendingMentorsInput = z.infer<
  typeof getPendingMentorsInputSchema
>;

export const updateMentorStatusInputSchema = z.object({
  mentorUserId: z.string(),
  status: z.enum(["requested", "approved", "active"]),
});

export type UpdateMentorStatusInput = z.infer<
  typeof updateMentorStatusInputSchema
>;
