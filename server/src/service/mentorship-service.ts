import { and, eq, notInArray, or } from "drizzle-orm";
import { mentors, mentorshipMatches } from "../data/db/schema.js";
import { db } from "../data/db/sql.js";
import type { MenteeRepository } from "../data/repository/mentee-repo.js";
import type { MentorRepository } from "../data/repository/mentor-repo.js";
import type { MatchingService } from "./matching-service.js";
import type {
  MatchedMentee,
  MatchedMentor,
  MentorshipDataOutput,
  PendingMenteeRequest,
  SuggestedMentor,
} from "../types/mentorship-types.js";
import type { CreateMenteeInput } from "../types/mentee-types.js";
import type { CreateMentorInput } from "../types/mentor-types.js";

/**
 * Service to handle mentorship data aggregation
 */
export class MentorshipService {
  constructor(
    private mentorRepo: MentorRepository,
    private menteeRepo: MenteeRepository,
    private matchingService?: MatchingService,
  ) {}

  /**
   * Create a new mentor profile and generate embeddings
   */
  async createMentor(input: CreateMentorInput) {
    const mentor = await this.mentorRepo.createMentor(
      input.userId,
      input.mentorshipPreferences,
      input.yearsOfService,
      input.eligibilityData ?? undefined,
      input.status,
      input.resumeFileId,
      input.strengths,
      input.personalInterests,
      input.whyInterestedResponses,
      input.careerAdvice,
      input.preferredMenteeCareerStages,
      input.preferredMeetingFormat,
      input.hoursPerMonthCommitment,
    );

    if (this.matchingService) {
      await this.matchingService.createOrUpdateMentorEmbeddings({
        userId: input.userId,
        whyInterestedResponses: input.whyInterestedResponses,
        strengths: input.strengths,
        personalInterests: input.personalInterests,
        careerAdvice: input.careerAdvice,
      });
    }

    return mentor;
  }

  /**
   * Create a new mentee profile, generate embeddings, and return mentor recommendations
   */
  async createMentee(input: CreateMenteeInput) {
    await this.menteeRepo.createMentee(
      input.userId,
      input.learningGoals,
      input.experienceLevel,
      input.preferredMentorType,
      input.status,
      input.resumeFileId,
      input.personalInterests,
      input.roleModelInspiration,
      input.hopeToGainResponses,
      input.mentorQualities,
      input.preferredMeetingFormat,
      input.hoursPerMonthCommitment,
    );

    if (this.matchingService) {
      await this.matchingService.createOrUpdateMenteeEmbeddings({
        userId: input.userId,
        learningGoals: input.learningGoals,
        personalInterests: input.personalInterests,
        roleModelInspiration: input.roleModelInspiration,
        hopeToGainResponses: input.hopeToGainResponses,
        mentorQualities: input.mentorQualities,
      });
    }

    return this.matchingService
      ? await this.matchingService.generateMentorRecommendations(input.userId)
      : [];
  }

  /**
   * Get mentorship data for a user (mentor profile, mentee profile, and matches)
   * Returns different data based on user's role:
   *
   * MENTEE VIEW ("Your Mentor"):
   * - Case 1: No mentee profile -> mentee is null
   * - Case 2: Mentee exists with pending suggestions -> suggestedMentors array
   * - Case 3: Mentee exists with accepted matches -> matchedMentors array
   *
   * MENTOR VIEW ("Your Mentee"):
   * - Case 1: No mentor profile -> mentor is null
   * - Case 2: Mentor exists with pending requests -> pendingMenteeRequests array
   * - Case 3: Mentor exists with accepted matches -> matchedMentees array (can coexist with pending)
   */
  async getMentorshipData(userId: string): Promise<MentorshipDataOutput> {
    // Get mentor and mentee profiles
    const [mentor, mentee] = await Promise.all([
      this.mentorRepo.getMentorByUserId(userId),
      this.menteeRepo.getMenteeByUserId(userId),
    ]);

    // Get all matches where the user is involved
    const allMatches = await db
      .select({
        matchId: mentorshipMatches.matchId,
        requestorUserId: mentorshipMatches.requestorUserId,
        mentorUserId: mentorshipMatches.mentorUserId,
        status: mentorshipMatches.status,
        matchedAt: mentorshipMatches.matchedAt,
      })
      .from(mentorshipMatches)
      .where(
        or(
          eq(mentorshipMatches.mentorUserId, userId),
          eq(mentorshipMatches.requestorUserId, userId),
        ),
      );

    const result: MentorshipDataOutput = {
      mentor,
      mentee,
      matches: allMatches.map((match) => ({
        matchId: match.matchId,
        requestorUserId: match.requestorUserId ?? "",
        mentorUserId: match.mentorUserId ?? "",
        status: match.status as "pending" | "accepted" | "declined",
        matchedAt: match.matchedAt,
      })),
    };

    // ============================================
    // MENTEE VIEW: "Your Mentor" section
    // ============================================
    if (mentee) {
      // Get matches where user is the requestor (mentee) with accepted status
      const acceptedMatches = allMatches.filter(
        (match) =>
          match.requestorUserId === userId && match.status === "accepted",
      );

      // Get all matches where user is requestor (pending or accepted)
      const allMenteeMatches = allMatches.filter(
        (match) => match.requestorUserId === userId,
      );

      // Case 3: User has accepted matches - return matched mentors with full info
      if (acceptedMatches.length > 0) {
        const matchedMentors: MatchedMentor[] = [];
        for (const match of acceptedMatches) {
          if (!match.mentorUserId) continue;
          const mentorProfile = await this.mentorRepo.getMentorByUserId(
            match.mentorUserId,
          );
          if (mentorProfile) {
            matchedMentors.push({
              mentor: mentorProfile,
              matchId: match.matchId,
              status: match.status as "pending" | "accepted" | "declined",
              matchedAt: match.matchedAt,
            });
          }
        }
        result.matchedMentors = matchedMentors;
      }

      // Case 2: Get suggested mentors (approved mentors not yet matched/accepted)
      // Get mentor user IDs that user has already requested (pending or accepted)
      const requestedMentorIds = new Set(
        allMenteeMatches
          .map((match) => match.mentorUserId)
          .filter((id): id is string => id !== null),
      );

      // Get approved mentors that haven't been requested yet
      const suggestedMentorRecords = await db
        .select()
        .from(mentors)
        .where(
          and(
            eq(mentors.status, "approved"),
            requestedMentorIds.size > 0
              ? notInArray(mentors.userId, Array.from(requestedMentorIds))
              : undefined,
          ),
        )
        .limit(10);

      // Check which suggested mentors have pending requests
      const pendingRequestMentorIds = new Set(
        allMenteeMatches
          .filter(
            (match): match is typeof match & { mentorUserId: string } =>
              match.status === "pending" && match.mentorUserId !== null,
          )
          .map((match) => match.mentorUserId),
      );

      const suggestedMentors: SuggestedMentor[] = [];
      for (const mentorRecord of suggestedMentorRecords) {
        const mentorProfile = await this.mentorRepo.getMentorByUserId(
          mentorRecord.userId,
        );
        if (mentorProfile) {
          suggestedMentors.push({
            mentor: mentorProfile,
            hasRequested: pendingRequestMentorIds.has(mentorRecord.userId),
          });
        }
      }

      // Only include suggested mentors if there are no accepted matches
      // (if user has accepted matches, they don't need suggestions)
      if (acceptedMatches.length === 0 && suggestedMentors.length > 0) {
        result.suggestedMentors = suggestedMentors;
      }
    }

    // ============================================
    // MENTOR VIEW: "Your Mentee" section
    // ============================================
    if (mentor) {
      // Get matches where user is the mentor
      const mentorMatches = allMatches.filter(
        (match) => match.mentorUserId === userId,
      );

      if (mentorMatches.length > 0) {
        // Separate into pending requests and accepted matches
        const pendingRequests: PendingMenteeRequest[] = [];
        const matchedMentees: MatchedMentee[] = [];

        for (const match of mentorMatches) {
          if (!match.requestorUserId) continue;
          const menteeProfile = await this.menteeRepo.getMenteeByUserId(
            match.requestorUserId,
          );
          if (menteeProfile) {
            const menteeData = {
              mentee: menteeProfile,
              matchId: match.matchId,
              status: match.status as "pending" | "accepted" | "declined",
              matchedAt: match.matchedAt,
            };

            if (match.status === "pending") {
              pendingRequests.push(menteeData);
            } else if (match.status === "accepted") {
              matchedMentees.push(menteeData);
            }
          }
        }

        if (pendingRequests.length > 0) {
          result.pendingMenteeRequests = pendingRequests;
        }
        if (matchedMentees.length > 0) {
          result.matchedMentees = matchedMentees;
        }
      }
    }

    return result;
  }
}
