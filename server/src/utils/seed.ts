import { inArray, sql } from "drizzle-orm";
import {
  channels,
  messages,
  type NewRole,
  roles,
  userRoles,
} from "../data/db/schema.js";
import { db, shutdownPostgres } from "../data/db/sql.js";

interface RoleDefinition
  extends Omit<NewRole, "roleId" | "createdAt" | "updatedAt"> {
  roleKey: string;
}

interface RoleAssignment {
  userId: string;
  roleKey: string;
  assignedByUserId?: string | null;
}

type ChannelSeed = {
  name: string;
  metadata: Record<string, unknown>;
};

async function clearExistingSeedData() {
  await db.delete(userRoles);
  await db.delete(roles);
  await db.delete(messages);
  await db.delete(channels);
  console.log("🧹 Cleared existing channel, role, and message data");
}

async function assignRoles(
  assignments: RoleAssignment[],
  roleMap: Map<string, number>,
) {
  for (const assignment of assignments) {
    const roleId = roleMap.get(assignment.roleKey);
    if (roleId === undefined) {
      throw new Error(`Missing seeded role for ${assignment.roleKey}`);
    }

    await db
      .insert(userRoles)
      .values({
        userId: assignment.userId,
        roleId,
        assignedBy: assignment.assignedByUserId ?? null,
      })
      .onConflictDoUpdate({
        target: [userRoles.userId, userRoles.roleId],
        set: {
          assignedAt: sql`now()`,
          assignedBy: assignment.assignedByUserId ?? null,
        },
      });
  }
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

async function seedMessages(channelMap: Map<string, number>, userId: string) {
  const channelIds = Array.from(channelMap.values());

  if (channelIds.length > 0) {
    await db.delete(messages).where(inArray(messages.channelId, channelIds));
  }

  const messageSeeds = [
    {
      channelName: "Operations",
      message: "Shift change briefing posted for review.",
    },
    {
      channelName: "Operations",
      message: "Logistics update: supply convoy ETA 14:30Z.",
    },
    {
      channelName: "Mentorship",
      message: "Welcome new mentees! Introduce yourselves in this thread.",
    },
    {
      channelName: "Mentorship",
      message: "Reminder: mentor sync tomorrow at 0900 in the ready room.",
    },
  ];

  for (const seed of messageSeeds) {
    const channelId = channelMap.get(seed.channelName);
    if (channelId === undefined) {
      throw new Error(`Missing channel ID for ${seed.channelName}`);
    }

    await db.insert(messages).values({
      channelId,
      senderId: userId,
      message: seed.message,
    });
  }
}

async function seed() {
  await clearExistingSeedData();

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

  const roleMap = await upsertRoles(rolesToSeed);

  const regularUserId = "GANyQUd1PuKzCcEF7CIii4DMaMDCWSyn";

  const assignments: RoleAssignment[] = [
    {
      userId: regularUserId,
      roleKey: `channel:${opsChannelId}:read`,
    },
    {
      userId: regularUserId,
      roleKey: `channel:${opsChannelId}:insert`,
    },
    {
      userId: regularUserId,
      roleKey: `channel:${mentorshipChannelId}:read`,
    },
  ];

  await assignRoles(assignments, roleMap);

  await seedMessages(channelMap, regularUserId);

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
  console.log("👤 Role assignments:");
  for (const assignment of assignments) {
    console.log(`  • ${assignment.userId} -> ${assignment.roleKey}`);
  }
  console.log("\n💬 Seeded messages:");
  console.log("  • 2 in Operations");
  console.log("  • 2 in Mentorship\n");
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
