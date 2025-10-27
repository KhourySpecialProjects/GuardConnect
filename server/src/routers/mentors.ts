import { MentorRepository } from "../data/repository/mentor-repo.js";
import { MatchingService } from "../service/matching-service.js";
import { procedure, router } from "../trpc/trpc.js";
import { createMentorInputSchema } from "../types/mentor-types.js";
import log from "../utils/logger.js";

const mentorRepo = new MentorRepository();
const matchingService = new MatchingService();

const createMentor = procedure
  .input(createMentorInputSchema)
  .mutation(async ({ input }) => {
    log.debug("createMentor", { userId: input.userId });

    const mentor = await mentorRepo.createMentor(
      input.userId,
      input.mentorshipPreferences,
      input.rank,
      input.yearsOfService,
      input.eligibilityData,
      input.status,
    );

    // Trigger matching process
    try {
      await matchingService.triggerMatchingForNewMentor(input.userId);
      log.info("Matching process triggered successfully for new mentor", {
        mentorId: mentor.mentorId,
      });
    } catch (error) {
      log.error("Failed to trigger matching process for new mentor", {
        mentorId: mentor.mentorId,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return mentor;
  });

const getMentors = procedure.query(() => {
  log.debug("getMentors");
  return ["Alice", "Bob"];
});

export const mentorRouter = router({
  createMentor,
  getMentors,
});
