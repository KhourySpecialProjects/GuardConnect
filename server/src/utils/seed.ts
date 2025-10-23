import { randomBytes, randomUUID, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { inArray, sql } from "drizzle-orm";
import {
  account,
  channels,
  type NewRole,
  type NewUser,
  roles,
  userRoles,
  users,
} from "../data/db/schema.js";
import { db, shutdownPostgres } from "../data/db/sql.js";

const scryptAsync = promisify(scrypt);

/**
 * Hash a password using scrypt (compatible with Better Auth's password hashing)
 */
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

interface RoleDefinition
  extends Omit<NewRole, "roleId" | "createdAt" | "updatedAt"> {
  roleKey: string;
}

interface RoleAssignment {
  userEmail: string;
  roleKey: string;
  assignedByEmail?: string;
}

type ChannelSeed = {
  name: string;
  metadata: Record<string, unknown>;
};

async function cleanupExistingData(userIds: string[]) {
  // Delete users (cascade will handle related records like sessions, accounts, user_roles, etc.)
  await db.delete(users).where(inArray(users.id, userIds));
  console.log(
    `🗑️  Deleted ${userIds.length} existing users and their related data`,
  );
}

async function _upsertUsers(seedUsers: NewUser[]) {
  // First, check which users already exist by ID or email and clean them up
  const existingUsersByIdOrEmail = await db
    .select({ id: users.id })
    .from(users)
    .where(
      sql`${users.id} IN (${sql.join(
        seedUsers.map((u) => sql`${u.id}`),
        sql`, `,
      )}) OR ${users.email} IN (${sql.join(
        seedUsers.map((u) => sql`${u.email}`),
        sql`, `,
      )})`,
    );

  if (existingUsersByIdOrEmail.length > 0) {
    await cleanupExistingData(existingUsersByIdOrEmail.map((u) => u.id));
  }

  // Now insert fresh data
  await db.insert(users).values(seedUsers);

  const userRows = await db
    .select({ userId: users.id, email: users.email })
    .from(users)
    .where(
      inArray(
        users.email,
        seedUsers.map((u) => u.email),
      ),
    );

  return new Map(userRows.map((row) => [row.email, row.userId]));
}

async function upsertChannels(seedChannels: ChannelSeed[]) {
  const channelMap = new Map<string, number>();

  // Delete existing channels (cascade will handle related records)
  const existingChannels = await db
    .select({ channelId: channels.channelId, name: channels.name })
    .from(channels)
    .where(
      inArray(
        channels.name,
        seedChannels.map((c) => c.name),
      ),
    );

  if (existingChannels.length > 0) {
    await db.delete(channels).where(
      inArray(
        channels.channelId,
        existingChannels.map((c) => c.channelId),
      ),
    );
    console.log(
      `🗑️  Deleted ${existingChannels.length} existing channels and their related data`,
    );
  }

  // Insert fresh channels
  for (const { name, metadata } of seedChannels) {
    const [created] = await db
      .insert(channels)
      .values({ name, metadata })
      .returning({ channelId: channels.channelId });

    if (!created) {
      throw new Error(`Failed to create channel ${name}`);
    }

    channelMap.set(name, created.channelId);
  }

  return channelMap;
}

async function upsertRoles(seedRoles: RoleDefinition[]) {
  await db
    .insert(roles)
    .values(seedRoles)
    .onConflictDoUpdate({
      target: roles.roleKey,
      set: {
        namespace: sql`excluded.namespace`,
        subjectId: sql`excluded.subject_id`,
        action: sql`excluded.action`,
        channelId: sql`excluded.channel_id`,
        metadata: sql`excluded.metadata`,
        description: sql`excluded.description`,
        updatedAt: sql`now()`,
      },
    });

  const roleRows = await db
    .select({ roleId: roles.roleId, roleKey: roles.roleKey })
    .from(roles)
    .where(
      inArray(
        roles.roleKey,
        seedRoles.map((role) => role.roleKey),
      ),
    );

  return new Map(roleRows.map((row) => [row.roleKey, row.roleId]));
}

async function _upsertUserRoles(
  assignments: RoleAssignment[],
  userMap: Map<string, string>,
  roleMap: Map<string, number>,
) {
  for (const assignment of assignments) {
    const userId = userMap.get(assignment.userEmail);
    if (userId === undefined) {
      throw new Error(`Missing seeded user for ${assignment.userEmail}`);
    }

    const roleId = roleMap.get(assignment.roleKey);
    if (roleId === undefined) {
      throw new Error(`Missing seeded role for ${assignment.roleKey}`);
    }

    const assignedBy = assignment.assignedByEmail
      ? (userMap.get(assignment.assignedByEmail) ?? null)
      : null;

    await db
      .insert(userRoles)
      .values({
        userId,
        roleId,
        assignedBy,
      })
      .onConflictDoUpdate({
        target: [userRoles.userId, userRoles.roleId],
        set: {
          assignedAt: sql`now()`,
          assignedBy,
        },
      });
  }
}

async function _createPasswordAccounts(
  credentials: Array<{ userId: string; email: string; password: string }>,
  userMap: Map<string, string>,
) {
  for (const { email, password } of credentials) {
    const userId = userMap.get(email);
    if (userId === undefined) {
      throw new Error(`Missing seeded user for ${email}`);
    }

    // Hash the password using scrypt
    const hashedPassword = await hashPassword(password);

    await db
      .insert(account)
      .values({
        id: randomUUID(),
        accountId: email,
        providerId: "credential",
        userId,
        password: hashedPassword,
      })
      .onConflictDoNothing();
  }
}

async function seed() {
  const channelsToSeed: ChannelSeed[] = [
    {
      name: "Operations",
      metadata: { description: "Operations command channel" },
    },
    {
      name: "Mentorship",
      metadata: { description: "Mentorship coordination channel" },
    },
  ];

  const channelMap = await upsertChannels(channelsToSeed);

  const opsChannelId = channelMap.get("Operations");
  const mentorshipChannelId = channelMap.get("Mentorship");

  if (opsChannelId === undefined || mentorshipChannelId === undefined) {
    throw new Error("Seeding prerequisites missing required IDs");
  }

  const rolesToSeed: RoleDefinition[] = [
    {
      namespace: "channel",
      subjectId: String(opsChannelId),
      action: "read",
      roleKey: `channel:${opsChannelId}:read`,
      channelId: opsChannelId,
      metadata: { channelName: "Operations", capability: "read" },
      description: "Read access to channel messages",
    },
    {
      namespace: "channel",
      subjectId: String(opsChannelId),
      action: "admin",
      roleKey: `channel:${opsChannelId}:admin`,
      channelId: opsChannelId,
      metadata: { channelName: "Operations", capability: "administration" },
      description: "Administrative privileges for the channel",
    },
    {
      namespace: "channel",
      subjectId: String(opsChannelId),
      action: "insert",
      roleKey: `channel:${opsChannelId}:insert`,
      channelId: opsChannelId,
      metadata: { channelName: "Operations", capability: "publish" },
      description: "Publish or insert new messages into the channel",
    },
    {
      namespace: "channel",
      subjectId: String(mentorshipChannelId),
      action: "read",
      roleKey: `channel:${mentorshipChannelId}:read`,
      channelId: mentorshipChannelId,
      metadata: { channelName: "Mentorship", capability: "read" },
      description: "Read access to channel messages",
    },
    {
      namespace: "mentor",
      subjectId: "mentorship",
      action: "mentor",
      roleKey: "mentor",
      channelId: null,
      metadata: { capability: "mentor-role" },
      description:
        "Identifies the user as a mentor with full mentorship privileges",
    },
    {
      namespace: "mentor",
      subjectId: "mentorship",
      action: "mentee",
      roleKey: "mentee",
      channelId: null,
      metadata: { capability: "mentee-role" },
      description: "Identifies the user as a mentee with mentorship access",
    },
  ];

  const _roleMap = await upsertRoles(rolesToSeed);

  // Print summary of seeded data
  console.log("\n📊 Mock Data Summary:");
  console.log("\n📢 Channels:");
  console.log(`  • Operations (ID: ${opsChannelId})`);
  console.log(`  • Mentorship (ID: ${mentorshipChannelId})`);
  console.log("\n🔑 Sample roles:");
  console.log(`  • channel:${opsChannelId}:admin - Operations admin access`);
  console.log(`  • channel:${opsChannelId}:read - Operations read access`);
  console.log(`  • channel:${opsChannelId}:insert - Operations write access`);
  console.log(
    `  • channel:${mentorshipChannelId}:read - Mentorship read access`,
  );
  console.log("  • mentor - Mentor role");
  console.log("  • mentee - Mentee role\n");
}

seed()
  .then(async () => {
    await shutdownPostgres();
    console.log("✅ Seed data applied successfully");
  })
  .catch(async (error) => {
    await shutdownPostgres();
    console.error("❌ Failed to seed database", error);
    process.exit(1);
  });
