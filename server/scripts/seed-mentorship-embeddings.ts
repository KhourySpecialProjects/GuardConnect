#!/usr/bin/env tsx
import { hashPassword } from "better-auth/crypto";
/* eslint-disable no-console */
import { and, eq } from "drizzle-orm";
import {
  account,
  mentees,
  mentorRecommendations,
  mentors,
  mentorshipMatches,
  users,
} from "../src/data/db/schema.js";
import { connectPostgres, db, shutdownPostgres } from "../src/data/db/sql.js";
import { MatchingService } from "../src/service/matching-service.js";

type SeedUserInput = {
  id: string;
  name: string;
  email: string;
  rank?: string;
  positionType?: "active" | "part-time";
  location?: string;
  phoneNumber?: string;
};

const DEFAULT_PASSWORD = "password";
const matchingService = new MatchingService();

type UserRow = typeof users.$inferSelect;
type AccountRow = typeof account.$inferSelect;
type MentorRow = typeof mentors.$inferSelect;
type MenteeRow = typeof mentees.$inferSelect;
type MentorRecommendationRow = typeof mentorRecommendations.$inferSelect;

async function ensureUser(input: SeedUserInput): Promise<UserRow> {
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.id, input.id))
    .limit(1);

  if (existing) {
    const needsUpdate =
      existing.name !== input.name ||
      existing.email !== input.email ||
      existing.rank !== input.rank ||
      existing.positionType !== input.positionType ||
      existing.location !== input.location ||
      existing.phoneNumber !== input.phoneNumber;

    if (!needsUpdate) return existing;

    const [updated] = await db
      .update(users)
      .set({
        name: input.name,
        email: input.email,
        rank: input.rank,
        positionType: input.positionType,
        location: input.location,
        phoneNumber: input.phoneNumber,
        emailVerified: true,
      })
      .where(eq(users.id, input.id))
      .returning();

    if (!updated) throw new Error(`Failed to update user ${input.id}`);
    return updated as UserRow;
  }

  const [created] = await db
    .insert(users)
    .values({
      id: input.id,
      name: input.name,
      email: input.email,
      rank: input.rank,
      positionType: input.positionType,
      location: input.location,
      phoneNumber: input.phoneNumber,
      emailVerified: true,
    })
    .returning();

  if (!created) throw new Error(`Failed to create user ${input.id}`);
  return created as UserRow;
}

async function ensurePasswordAccount(userId: string): Promise<AccountRow> {
  const [existing] = await db
    .select()
    .from(account)
    .where(
      and(eq(account.userId, userId), eq(account.providerId, "credential")),
    )
    .limit(1);

  const hashed = await hashPassword(DEFAULT_PASSWORD);

  if (existing) {
    const [updated] = await db
      .update(account)
      .set({ providerId: "credential", accountId: userId, password: hashed })
      .where(eq(account.id, existing.id))
      .returning();
    if (!updated)
      throw new Error(`Failed to update credential account for ${userId}`);
    return updated as AccountRow;
  }

  const [created] = await db
    .insert(account)
    .values({
      id: `${userId}-credential`,
      userId,
      providerId: "credential",
      accountId: userId,
      password: hashed,
    })
    .returning();
  if (!created)
    throw new Error(`Failed to create credential account for ${userId}`);
  return created as AccountRow;
}

const MENTOR_DATA: Record<
  string,
  {
    yearsOfService: number;
    strengths: string[];
    personalInterests: string;
    whyInterestedResponses: string[];
    careerAdvice: string;
    preferredMeetingFormat: "hybrid" | "virtual" | "in-person";
    hoursPerMonthCommitment: number;
  }
> = {
  "mock-mentor-1": {
    yearsOfService: 8,
    strengths: ["coaching", "career-planning"],
    personalInterests: "running, woodworking",
    whyInterestedResponses: [
      "I want to give back to junior soldiers.",
      "I enjoy mentoring one-on-one.",
    ],
    careerAdvice: "Consistency beats intensity.",
    preferredMeetingFormat: "hybrid",
    hoursPerMonthCommitment: 3,
  },
  "mock-mentor-2": {
    yearsOfService: 12,
    strengths: ["technical-leadership", "systems-thinking"],
    personalInterests: "hiking, open source software",
    whyInterestedResponses: [
      "I want to help people grow into senior roles.",
      "Mentorship accelerates growth more than any course.",
    ],
    careerAdvice: "Build depth before breadth.",
    preferredMeetingFormat: "virtual",
    hoursPerMonthCommitment: 4,
  },
  "mock-mentor-3": {
    yearsOfService: 6,
    strengths: ["communication", "project-management"],
    personalInterests: "photography, cycling",
    whyInterestedResponses: [
      "I had great mentors and want to pay it forward.",
      "Helping others navigate their careers is deeply rewarding.",
    ],
    careerAdvice: "Ask for feedback early and often.",
    preferredMeetingFormat: "in-person",
    hoursPerMonthCommitment: 2,
  },
  "mock-mentor-4": {
    yearsOfService: 15,
    strengths: ["strategic-thinking", "operations"],
    personalInterests: "reading, chess",
    whyInterestedResponses: [
      "Experience is only valuable if you share it.",
      "I want to help mentees avoid mistakes I made early on.",
    ],
    careerAdvice: "Clarity of purpose matters more than speed.",
    preferredMeetingFormat: "hybrid",
    hoursPerMonthCommitment: 5,
  },
};

const MENTEE_DATA = {
  learningGoals: "Grow as a team lead and transition to tech ops.",
  experienceLevel: "mid-level" as const,
  preferredMentorType: "operations",
  personalInterests: "fitness, cooking",
  roleModelInspiration: "Sgt. Smith",
  hopeToGainResponses: [
    "Structured career guidance",
    "Accountability for monthly goals",
  ],
  mentorQualities: ["strong-communicator", "experienced-leader"],
  preferredMeetingFormat: "virtual" as const,
  hoursPerMonthCommitment: 2,
};

async function ensureMentor(userId: string): Promise<MentorRow> {
  const data = MENTOR_DATA[userId];
  if (!data) throw new Error(`No mentor data defined for ${userId}`);

  const [existing] = await db
    .select()
    .from(mentors)
    .where(eq(mentors.userId, userId))
    .limit(1);

  if (existing) {
    console.log(`  Mentor ${userId} already exists, skipping DB insert`);
    return existing;
  }

  const [created] = await db
    .insert(mentors)
    .values({ userId, status: "active", ...data })
    .returning();

  if (!created) throw new Error(`Failed to create mentor for ${userId}`);

  console.log(`  Generating embeddings for mentor ${userId}...`);
  await matchingService.createOrUpdateMentorEmbeddings({
    userId,
    whyInterestedResponses: data.whyInterestedResponses,
    strengths: data.strengths,
    personalInterests: data.personalInterests,
    careerAdvice: data.careerAdvice,
  });
  console.log(`  Embeddings done for mentor ${userId}`);

  return created as MentorRow;
}

async function ensureMentee(userId: string): Promise<MenteeRow> {
  const [existing] = await db
    .select()
    .from(mentees)
    .where(eq(mentees.userId, userId))
    .limit(1);

  if (existing) {
    console.log(`  Mentee ${userId} already exists, skipping DB insert`);
    return existing;
  }

  const [created] = await db
    .insert(mentees)
    .values({ userId, status: "active", ...MENTEE_DATA })
    .returning();

  if (!created) throw new Error(`Failed to create mentee for ${userId}`);

  console.log(`  Generating embeddings for mentee ${userId}...`);
  await matchingService.createOrUpdateMenteeEmbeddings({
    userId,
    learningGoals: MENTEE_DATA.learningGoals,
    personalInterests: MENTEE_DATA.personalInterests,
    roleModelInspiration: MENTEE_DATA.roleModelInspiration,
    hopeToGainResponses: MENTEE_DATA.hopeToGainResponses,
    mentorQualities: MENTEE_DATA.mentorQualities,
  });
  console.log(`  Embeddings done for mentee ${userId}`);

  return created as MenteeRow;
}

async function upsertRecommendation(
  userId: string,
  recommendedMentorIds: string[],
): Promise<MentorRecommendationRow> {
  const [existing] = await db
    .select()
    .from(mentorRecommendations)
    .where(eq(mentorRecommendations.userId, userId))
    .limit(1);

  if (existing) {
    const merged = Array.from(
      new Set([
        ...(existing.recommendedMentorIds ?? []),
        ...recommendedMentorIds,
      ]),
    );
    const [updated] = await db
      .update(mentorRecommendations)
      .set({ recommendedMentorIds: merged })
      .where(eq(mentorRecommendations.userId, userId))
      .returning();
    if (!updated)
      throw new Error(`Failed to update mentor recommendations for ${userId}`);
    return updated as MentorRecommendationRow;
  }

  const [created] = await db
    .insert(mentorRecommendations)
    .values({ userId, recommendedMentorIds })
    .returning();
  if (!created)
    throw new Error(`Failed to create mentor recommendations for ${userId}`);
  return created as MentorRecommendationRow;
}

async function ensureMatch(
  menteeUserId: string,
  mentorUserId: string,
  status: "pending" | "accepted" | "declined",
) {
  const [existing] = await db
    .select()
    .from(mentorshipMatches)
    .where(
      and(
        eq(mentorshipMatches.requestorUserId, menteeUserId),
        eq(mentorshipMatches.mentorUserId, mentorUserId),
      ),
    )
    .limit(1);

  if (existing) return existing;

  const [created] = await db
    .insert(mentorshipMatches)
    .values({
      requestorUserId: menteeUserId,
      mentorUserId,
      status,
      matchedAt: new Date(),
      message:
        status === "pending"
          ? "Looking forward to learning from you!"
          : "Thanks for accepting!",
    })
    .returning();

  if (!created) {
    throw new Error(
      `Failed to create match between mentee ${menteeUserId} and mentor ${mentorUserId}`,
    );
  }

  return created;
}

/**
 * Seeds mock mentorship data with real Bedrock embeddings.
 * Requires AWS credentials with bedrock:InvokeModel permission.
 *
 * Usage:
 *   cd server
 *   npx tsx --env-file=.env scripts/seed-mentorship-embeddings.ts
 */
async function main() {
  console.log("Seeding mock mentorship data with embeddings...");
  await connectPostgres();

  const mentorA = await ensureUser({
    id: "mock-mentor-1",
    name: "Alex Rivera",
    email: "alex.rivera@example.com",
    rank: "Frontend",
    positionType: "part-time",
    location: "Boise, ID",
    phoneNumber: "555-0101",
  });
  const mentorB = await ensureUser({
    id: "mock-mentor-2",
    name: "Jordan Casey",
    email: "jordan.casey@example.com",
    rank: "Tech Lead",
    positionType: "part-time",
    location: "Boston, MA",
    phoneNumber: "555-0102",
  });
  const mentorC = await ensureUser({
    id: "mock-mentor-3",
    name: "Morgan Blake",
    email: "morgan.blake@example.com",
    rank: "PM",
    positionType: "active",
    location: "Austin, TX",
    phoneNumber: "555-0103",
  });
  const mentorD = await ensureUser({
    id: "mock-mentor-4",
    name: "Taylor Quinn",
    email: "taylor.quinn@example.com",
    rank: "Ops Lead",
    positionType: "active",
    location: "Chicago, IL",
    phoneNumber: "555-0104",
  });

  const menteeA = await ensureUser({
    id: "mock-mentee-1",
    name: "Sam Holloway",
    email: "sam.holloway@example.com",
    rank: "PM/Frontend",
    positionType: "part-time",
    location: "Boston, MA",
    phoneNumber: "555-0105",
  });
  const menteeB = await ensureUser({
    id: "mock-mentee-2",
    name: "Drew Langston",
    email: "drew.langston@example.com",
    rank: "PM/Frontend",
    positionType: "part-time",
    location: "Boston, MA",
    phoneNumber: "555-0106",
  });

  await ensureMentor(mentorA.id);
  await ensureMentor(mentorB.id);
  await ensureMentor(mentorC.id);
  await ensureMentor(mentorD.id);
  await ensureMentee(menteeA.id);
  await ensureMentee(menteeB.id);

  await ensurePasswordAccount(mentorA.id);
  await ensurePasswordAccount(mentorB.id);
  await ensurePasswordAccount(mentorC.id);
  await ensurePasswordAccount(mentorD.id);
  await ensurePasswordAccount(menteeA.id);
  await ensurePasswordAccount(menteeB.id);

  await ensureMatch(menteeA.id, mentorB.id, "pending");
  await ensureMatch(menteeB.id, mentorB.id, "pending");
  await upsertRecommendation(menteeA.id, [
    mentorA.id,
    mentorB.id,
    mentorC.id,
    mentorD.id,
  ]);
  await upsertRecommendation(menteeB.id, [
    mentorA.id,
    mentorB.id,
    mentorC.id,
    mentorD.id,
  ]);

  console.log("\nSeed complete.");
  console.log("Users created:");
  console.log(` ${mentorA.name}: ${mentorA.email}`);
  console.log(` ${mentorB.name}: ${mentorB.email}`);
  console.log(` ${mentorC.name}: ${mentorC.email}`);
  console.log(` ${mentorD.name}: ${mentorD.email}`);
  console.log(` ${menteeA.name}: ${menteeA.email}`);
  console.log(` ${menteeB.name}: ${menteeB.email}`);
  console.log(`\nDefault password for all: ${DEFAULT_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await shutdownPostgres();
  });
