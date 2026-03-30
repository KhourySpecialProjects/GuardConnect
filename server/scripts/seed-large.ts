#!/usr/bin/env tsx
import { hashPassword } from "better-auth/crypto";
/* eslint-disable no-console */
import { and, eq } from "drizzle-orm";
import {
  account,
  mentees,
  mentorRecommendations,
  mentors,
  users,
} from "../src/data/db/schema.js";
import { connectPostgres, db, shutdownPostgres } from "../src/data/db/sql.js";
import { MatchingService } from "../src/service/matching-service.js";

const DEFAULT_PASSWORD = "password";
const matchingService = new MatchingService();

// ─── Name pool ────────────────────────────────────────────────────────────────
const FIRST_NAMES = [
  "Alex",
  "Jordan",
  "Morgan",
  "Taylor",
  "Casey",
  "Riley",
  "Avery",
  "Quinn",
  "Blake",
  "Drew",
  "Reese",
  "Skyler",
  "Parker",
  "Dakota",
  "Hayden",
  "Emery",
  "Finley",
  "Rowan",
  "Sage",
  "River",
  "Phoenix",
  "Marlowe",
  "Kendall",
  "Peyton",
  "Lennox",
  "Harlow",
  "Sloane",
  "Tatum",
  "Beckett",
  "Elliot",
];
const LAST_NAMES = [
  "Rivera",
  "Casey",
  "Blake",
  "Quinn",
  "Holloway",
  "Langston",
  "Monroe",
  "Steele",
  "Vance",
  "Archer",
  "Mercer",
  "Haynes",
  "Caldwell",
  "Briggs",
  "Holt",
  "Stanton",
  "Cross",
  "Sutton",
  "Lowe",
  "Chandler",
  "Preston",
  "Graves",
  "Whitmore",
  "Ashford",
  "Kimball",
  "Novak",
  "Decker",
  "Frost",
  "Garner",
  "Hale",
];
const RANKS = [
  "E-4",
  "E-5",
  "E-6",
  "E-7",
  "O-1",
  "O-2",
  "O-3",
  "CW2",
  "CW3",
  "SGT",
  "SSG",
  "SFC",
  "MSG",
  "1LT",
  "CPT",
  "MAJ",
];
const LOCATIONS = [
  "Boston, MA",
  "Austin, TX",
  "Chicago, IL",
  "Denver, CO",
  "Seattle, WA",
  "Atlanta, GA",
  "Phoenix, AZ",
  "Nashville, TN",
  "Portland, OR",
  "Miami, FL",
  "Columbus, OH",
  "Indianapolis, IN",
  "San Antonio, TX",
  "Charlotte, NC",
];

// ─── Mentor variation pools ────────────────────────────────────────────────────
const MENTOR_STRENGTHS_POOL = [
  ["coaching", "career-planning"],
  ["technical-leadership", "systems-thinking"],
  ["communication", "project-management"],
  ["strategic-thinking", "operations"],
  ["mentoring", "team-building"],
  ["problem-solving", "analytical-thinking"],
  ["leadership", "conflict-resolution"],
  ["training", "curriculum-development"],
  ["logistics", "supply-chain"],
  ["cyber", "information-assurance"],
];
const MENTOR_WHY_POOL = [
  [
    "I want to give back to those earlier in their career.",
    "Mentorship shaped who I am today.",
  ],
  [
    "I believe sharing experience accelerates growth.",
    "I had great mentors and want to pay it forward.",
  ],
  [
    "Helping others navigate challenges is deeply rewarding.",
    "I enjoy seeing people reach their potential.",
  ],
  [
    "I want to share lessons from my mistakes so others don't repeat them.",
    "Mentoring keeps me sharp too.",
  ],
  [
    "Every junior member deserves a guide.",
    "I learned the hard way and want to make it easier for others.",
  ],
  [
    "Connection and growth are what drive me.",
    "I want to leave a legacy through the people I develop.",
  ],
  [
    "I thrive when I'm helping someone level up.",
    "The best investment you can make is in people.",
  ],
  [
    "I want to bridge the gap between experience and opportunity.",
    "Mentorship changed my trajectory.",
  ],
];
const MENTOR_ADVICE_POOL = [
  "Consistency beats intensity every time.",
  "Build depth before breadth.",
  "Ask for feedback early and often.",
  "Clarity of purpose matters more than speed.",
  "Relationships are your greatest asset.",
  "Own your mistakes and move forward fast.",
  "Seek discomfort — that's where growth lives.",
  "Document everything. Memory is unreliable.",
  "Invest in your communication skills above all else.",
  "Show up fully or don't show up at all.",
];
const MENTOR_INTERESTS_POOL = [
  "running, woodworking",
  "hiking, open source software",
  "photography, cycling",
  "reading, chess",
  "cooking, travel",
  "fitness, music production",
  "gaming, podcasting",
  "gardening, astronomy",
  "martial arts, writing",
  "fishing, volunteering",
];
const MEETING_FORMATS = [
  "hybrid",
  "virtual",
  "in-person",
] as const satisfies readonly ("hybrid" | "virtual" | "in-person")[];
const _MENTOR_CAREER_STAGES = [
  ["junior-ncos", "transitioning"],
  ["senior-ncos", "officers"],
  ["junior-ncos", "senior-ncos"],
  ["transitioning", "officers"],
  ["junior-ncos"],
  ["senior-ncos"],
] as const;

// ─── Mentee variation pools ────────────────────────────────────────────────────
const MENTEE_GOALS_POOL = [
  "Grow as a team lead and transition to tech ops.",
  "Build leadership skills and prepare for promotion.",
  "Develop my communication and briefing skills.",
  "Transition from the military into a civilian tech career.",
  "Improve my strategic planning and decision-making.",
  "Develop expertise in logistics and supply chain management.",
  "Strengthen my ability to lead under pressure.",
  "Learn how to manage complex projects end-to-end.",
  "Build my network and learn how to advocate for myself.",
  "Develop my technical skills in cybersecurity.",
];
const MENTEE_HOPE_POOL = [
  ["Structured career guidance", "Accountability for monthly goals"],
  ["Honest feedback on my performance", "A roadmap for the next 2 years"],
  ["Help navigating the promotion process", "Advice on work-life balance"],
  ["Exposure to career paths I haven't considered", "A trusted sounding board"],
  ["Help building confidence as a leader", "Tactical advice from experience"],
  ["Guidance on transitioning out", "Introduction to civilian networks"],
  [
    "Support setting and achieving goals",
    "Someone who's been where I want to go",
  ],
  ["Mentorship on communication skills", "Help preparing for key assessments"],
];
const MENTEE_QUALITIES_POOL = [
  ["strong-communicator", "experienced-leader"],
  ["patient", "detail-oriented"],
  ["strategic-thinker", "operations-focused"],
  ["technical-expert", "good-listener"],
  ["empathetic", "direct-feedback-giver"],
  ["connected", "career-focused"],
];
const MENTEE_ROLE_MODELS = [
  "A former NCO who always led by example.",
  "My first platoon sergeant — direct but fair.",
  "A civilian manager who invested in my growth.",
  "A senior officer who mentored me early in my career.",
  "A colleague who balanced excellence with empathy.",
  "A leader who prioritized people over metrics.",
  "My company commander who took time to develop junior leaders.",
  "A mentor from a previous unit who helped me find my path.",
];
const EXPERIENCE_LEVELS = ["entry-level", "mid-level", "senior"] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

function uniqueName(index: number): { name: string; email: string } {
  const first = FIRST_NAMES[index % FIRST_NAMES.length];
  const last =
    LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length];
  const name = `${first} ${last}`;
  const email = `${first.toLowerCase()}.${last.toLowerCase()}${index}@example.com`;
  return { name, email };
}

async function ensureUser(
  id: string,
  name: string,
  email: string,
  rank: string,
  location: string,
) {
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  if (existing) return existing;

  const [created] = await db
    .insert(users)
    .values({
      id,
      name,
      email,
      rank,
      positionType: "active",
      location,
      emailVerified: true,
    })
    .returning();
  if (!created) throw new Error(`Failed to create user ${id}`);
  return created;
}

async function ensurePasswordAccount(userId: string) {
  const [existing] = await db
    .select()
    .from(account)
    .where(
      and(eq(account.userId, userId), eq(account.providerId, "credential")),
    )
    .limit(1);
  if (existing) return;

  const hashed = await hashPassword(DEFAULT_PASSWORD);
  await db.insert(account).values({
    id: `${userId}-credential`,
    userId,
    providerId: "credential",
    accountId: userId,
    password: hashed,
  });
}

async function seedMentor(index: number) {
  const id = `seed-mentor-${index}`;
  const { name, email } = uniqueName(index);
  const rank = pick(RANKS, index + 3);
  const location = pick(LOCATIONS, index);

  await ensureUser(id, name, email, rank, location);
  await ensurePasswordAccount(id);

  const [existing] = await db
    .select()
    .from(mentors)
    .where(eq(mentors.userId, id))
    .limit(1);
  if (existing) {
    console.log(`  skip mentor ${index + 1}/50 (${name}) — already exists`);
    return;
  }

  const strengths = pick(MENTOR_STRENGTHS_POOL, index);
  const whyInterestedResponses = pick(MENTOR_WHY_POOL, index);
  const careerAdvice = pick(MENTOR_ADVICE_POOL, index);
  const personalInterests = pick(MENTOR_INTERESTS_POOL, index);
  const preferredMeetingFormat = pick(MEETING_FORMATS, index);
  const hoursPerMonthCommitment = (index % 4) + 2; // 2–5 hrs

  await db.insert(mentors).values({
    userId: id,
    status: "active",
    yearsOfService: (index % 12) + 4,
    strengths,
    personalInterests,
    whyInterestedResponses,
    careerAdvice,
    preferredMeetingFormat,
    hoursPerMonthCommitment,
  });

  console.log(`  embedding mentor ${index + 1}/50 (${name})...`);
  await matchingService.createOrUpdateMentorEmbeddings({
    userId: id,
    whyInterestedResponses,
    strengths,
    personalInterests,
    careerAdvice,
  });
}

async function seedMentee(index: number) {
  const id = `seed-mentee-${index}`;
  const { name, email } = uniqueName(index + 50);
  const rank = pick(RANKS, index);
  const location = pick(LOCATIONS, index + 3);

  await ensureUser(id, name, email, rank, location);
  await ensurePasswordAccount(id);

  const [existing] = await db
    .select()
    .from(mentees)
    .where(eq(mentees.userId, id))
    .limit(1);
  if (existing) {
    console.log(`  skip mentee ${index + 1}/50 (${name}) — already exists`);
    return;
  }

  const learningGoals = pick(MENTEE_GOALS_POOL, index);
  const hopeToGainResponses = pick(MENTEE_HOPE_POOL, index);
  const mentorQualities = pick(MENTEE_QUALITIES_POOL, index);
  const roleModelInspiration = pick(MENTEE_ROLE_MODELS, index);
  const personalInterests = pick(MENTOR_INTERESTS_POOL, index + 5);
  const preferredMeetingFormat = pick(MEETING_FORMATS, index + 1);
  const experienceLevel = pick(EXPERIENCE_LEVELS, index);

  await db.insert(mentees).values({
    userId: id,
    status: "active",
    learningGoals,
    experienceLevel,
    personalInterests,
    roleModelInspiration,
    hopeToGainResponses,
    mentorQualities,
    preferredMeetingFormat,
    hoursPerMonthCommitment: (index % 3) + 2,
  });

  console.log(`  embedding mentee ${index + 1}/50 (${name})...`);
  await matchingService.createOrUpdateMenteeEmbeddings({
    userId: id,
    learningGoals,
    personalInterests,
    roleModelInspiration,
    hopeToGainResponses,
    mentorQualities,
  });
}

/**
 * Seeds 50 mentors and 50 mentees with real Bedrock embeddings.
 * Runs sequentially to avoid Bedrock rate limits.
 *
 * Usage:
 *   cd server
 *   npx tsx --env-file=.env scripts/seed-large.ts
 */
async function main() {
  console.log("Seeding 50 mentors + 50 mentees with embeddings...\n");
  await connectPostgres();

  console.log("── Mentors ──────────────────────────────");
  for (let i = 0; i < 50; i++) {
    await seedMentor(i);
  }

  console.log("\n── Mentees ──────────────────────────────");
  for (let i = 0; i < 50; i++) {
    await seedMentee(i);
  }

  // Wire up recommendations: each mentee gets the first 10 mentors suggested
  console.log("\n── Recommendations ──────────────────────");
  for (let i = 0; i < 50; i++) {
    const menteeId = `seed-mentee-${i}`;
    const suggestedMentorIds = Array.from(
      { length: 10 },
      (_, j) => `seed-mentor-${(i + j) % 50}`,
    );
    await db
      .insert(mentorRecommendations)
      .values({ userId: menteeId, recommendedMentorIds: suggestedMentorIds })
      .onConflictDoUpdate({
        target: mentorRecommendations.userId,
        set: { recommendedMentorIds: suggestedMentorIds },
      });
  }

  console.log("\nDone. Default password for all accounts: password");
  console.log(
    "Login as any mentee: seed-mentee-0@example.com ... seed-mentee-49@example.com",
  );
  console.log(
    "Login as any mentor: seed-mentor-0@example.com ... seed-mentor-49@example.com",
  );
  console.log(
    "(actual emails follow the pattern: firstname.lastnameN@example.com)",
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await shutdownPostgres();
  });
