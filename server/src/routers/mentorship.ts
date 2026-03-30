import { z } from "zod";
import { MenteeRepository } from "../data/repository/mentee-repo.js";
import { MentorRepository } from "../data/repository/mentor-repo.js";
import { GLOBAL_ADMIN_KEY } from "../data/roles.js";
import { MatchingService } from "../service/matching-service.js";
import { MentorshipService } from "../service/mentorship-service.js";
import notificationService from "../service/notification-service.js";
import { withErrorHandling } from "../trpc/error_handler.js";
import { protectedProcedure, roleProcedure, router } from "../trpc/trpc.js";
import { createMenteeInputSchema } from "../types/mentee-types.js";
import {
  createMentorInputSchema,
  createMentorOutputSchema,
} from "../types/mentor-types.js";
import {
  getPendingMentorsInputSchema,
  mentorshipAdminStatsOutputSchema,
  mentorshipDataOutputSchema,
  updateMentorStatusInputSchema,
  updateOptInInputSchema,
} from "../types/mentorship-types.js";
import log from "../utils/logger.js";

const mentorRepo = new MentorRepository();
const menteeRepo = new MenteeRepository();
const mentorshipService = new MentorshipService(
  mentorRepo,
  menteeRepo,
  new MatchingService(),
  notificationService,
);

const createMentor = protectedProcedure
  .input(createMentorInputSchema)
  .output(createMentorOutputSchema)
  .meta({
    openapi: {
      method: "POST",
      path: "/mentorship.createMentor",
      summary: "Creates a new mentor profile for the current user",
      tags: ["Mentorship"],
    },
  })
  .mutation(({ input, ctx }) =>
    withErrorHandling("", async () => {
      const userId = ctx.auth.user.id;
      log.debug({ userId }, "createMentor");
      return await mentorshipService.createMentor({
        ...input,
        userId,
      });
    }),
  );

const createMentee = protectedProcedure
  .input(createMenteeInputSchema)
  .output(z.void())
  .meta({
    openapi: {
      method: "POST",
      path: "/mentorship.createMentee",
      summary: "Creates a new mentee profile for the current user",
      tags: ["Mentorship"],
    },
  })
  .mutation(({ input, ctx }) =>
    withErrorHandling("createMentee", async () => {
      return await mentorshipService.createMentee({
        ...input,
        userId: ctx.auth.user.id,
      });
    }),
  );

const requestMentorship = protectedProcedure
  .input(
    z.object({
      mentorUserId: z.string(),
      message: z.string().optional(),
    }),
  )
  .output(z.void())
  .meta({
    openapi: {
      method: "POST",
      path: "/mentorship.requestMentorship",
      summary: "Requests mentorship from a mentor",
      tags: ["Mentorship"],
    },
  })
  .mutation(({ input, ctx }) =>
    withErrorHandling("requestMentorship", async () => {
      return await mentorshipService.requestMentorship(
        ctx.auth.user.id,
        input.mentorUserId,
        input.message,
      );
    }),
  );

const declineMentorshipRequest = protectedProcedure
  .input(z.object({ matchId: z.number() }))
  .output(z.void())
  .meta({
    openapi: {
      method: "POST",
      path: "/mentorship.declineMentorshipRequest",
      summary: "Declines a mentorship request from a mentor",
      tags: ["Mentorship"],
    },
  })
  .mutation(({ input, ctx }) =>
    withErrorHandling("declineMentorshipRequest", async () => {
      return await mentorshipService.declineMentorshipRequest(
        input.matchId,
        ctx.auth.user.id,
      );
    }),
  );

const acceptMentorshipRequest = protectedProcedure
  .input(z.object({ matchId: z.number() }))
  .output(z.void())
  .meta({
    openapi: {
      method: "POST",
      path: "/mentorship.acceptMentorshipRequest",
      summary: "Accepts a mentorship request from a mentor",
      tags: ["Mentorship"],
    },
  })
  .mutation(({ input, ctx }) =>
    withErrorHandling("acceptMentorshipRequest", async () => {
      return await mentorshipService.acceptMentorshipRequest(
        input.matchId,
        ctx.auth.user.id,
      );
    }),
  );

const getMentorshipData = protectedProcedure
  .output(mentorshipDataOutputSchema)
  .meta({
    openapi: {
      method: "POST",
      path: "/mentorship.getMentorshipData",
      summary:
        "Get mentor/mentee data and communication information for mentorship homepage",
      tags: ["Mentorship"],
    },
  })
  .query(async ({ ctx }) =>
    withErrorHandling("getMentorshipData", async () => {
      const userId = ctx.auth.user.id;
      log.debug({ userId }, "getMentorshipData");
      return await mentorshipService.getMentorshipData(userId);
    }),
  );

const updateOptIn = protectedProcedure
  .input(updateOptInInputSchema)
  .output(z.void())
  .meta({
    openapi: {
      method: "POST",
      path: "/mentorship.updateOptIn",
      summary:
        "Update whether the current user is accepting new mentorship matches",
      tags: ["Mentorship"],
    },
  })
  .mutation(({ input, ctx }) =>
    withErrorHandling("updateOptIn", async () => {
      return await mentorshipService.updateOptIn(
        ctx.auth.user.id,
        input.role,
        input.isAccepting,
      );
    }),
  );

const getPendingMentors = roleProcedure([GLOBAL_ADMIN_KEY])
  .input(getPendingMentorsInputSchema)
  .query(({ input }) =>
    withErrorHandling("getPendingMentors", async () => {
      return await mentorshipService.getMentorsByStatus(input.status);
    }),
  );

const updateMentorStatus = roleProcedure([GLOBAL_ADMIN_KEY])
  .input(updateMentorStatusInputSchema)
  .mutation(({ input }) =>
    withErrorHandling("updateMentorStatus", async () => {
      await mentorshipService.updateMentorStatus(
        input.mentorUserId,
        input.status,
      );
    }),
  );

const getAdminStats = roleProcedure([GLOBAL_ADMIN_KEY])
  .output(mentorshipAdminStatsOutputSchema)
  .meta({
    openapi: {
      method: "GET",
      path: "/mentorship.getAdminStats",
      summary: "Get admin statistics for the mentorship program",
      tags: ["Mentorship"],
    },
  })
  .query(() =>
    withErrorHandling("getAdminStats", async () => {
      return await mentorshipService.getAdminStats();
    }),
  );

export const mentorshipRouter = router({
  createMentor,
  createMentee,
  requestMentorship,
  declineMentorshipRequest,
  acceptMentorshipRequest,
  getMentorshipData,
  updateOptIn,
  getPendingMentors,
  updateMentorStatus,
  getAdminStats,
});
