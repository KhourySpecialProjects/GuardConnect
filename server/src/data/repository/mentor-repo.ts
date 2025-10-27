import { eq } from "drizzle-orm";
import { ConflictError } from "../../types/errors.js";
import type { CreateMentorOutput } from "../../types/mentor-types.js";
import { mentors } from "../db/schema.js";
import { db } from "../db/sql.js";

/**
 * Repository to handle database queries/communication related to mentors
 */
export class MentorRepository {
  async createMentor(
    userId: string,
    mentorshipPreferences?: string,
    rank?: string,
    yearsOfService?: number,
    eligibilityData?: Record<string, unknown>,
    status: "requested" | "approved" | "active" = "requested",
  ): Promise<CreateMentorOutput> {
    // Check if mentor already exists for this user
    const existingMentor = await db
      .select()
      .from(mentors)
      .where(eq(mentors.userId, userId))
      .limit(1);

    if (existingMentor.length > 0) {
      throw new ConflictError("Mentor profile already exists for this user");
    }

    const [created] = await db
      .insert(mentors)
      .values({
        userId,
        mentorshipPreferences,
        rank,
        yearsOfService,
        eligibilityData,
        status,
      })
      .returning({
        mentorId: mentors.mentorId,
        userId: mentors.userId,
        mentorshipPreferences: mentors.mentorshipPreferences,
        rank: mentors.rank,
        yearsOfService: mentors.yearsOfService,
        eligibilityData: mentors.eligibilityData,
        status: mentors.status,
      });

    if (!created) {
      throw new ConflictError("Failed to create mentor profile");
    }

    return created;
  }

  async getMentorByUserId(userId: string): Promise<CreateMentorOutput | null> {
    const [mentor] = await db
      .select({
        mentorId: mentors.mentorId,
        userId: mentors.userId,
        mentorshipPreferences: mentors.mentorshipPreferences,
        rank: mentors.rank,
        yearsOfService: mentors.yearsOfService,
        eligibilityData: mentors.eligibilityData,
        status: mentors.status,
      })
      .from(mentors)
      .where(eq(mentors.userId, userId))
      .limit(1);

    return mentor || null;
  }
}
