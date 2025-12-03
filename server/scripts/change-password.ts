import { connectRedis, disconnectRedis } from "../src/data/db/redis.js";
import { connectPostgres, db, shutdownPostgres } from "../src/data/db/sql.js";
import { users, account } from "../src/data/db/schema.js";
import { eq, and } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";

/**
 * Set the password for a user (credential account) to the literal string "password".
 *
 * Usage:
 *   npx tsx --env-file=.env scripts/change-password.ts user@example.com
 */
async function main() {
  const emailArg = process.argv[2];
  if (!emailArg) {
    console.error("Usage: npx tsx --env-file=.env scripts/change-password.ts <user-email>");
    process.exit(1);
  }

  const email = String(emailArg).toLowerCase().trim();

  // Ensure DB connections
  await connectPostgres();
  await connectRedis().catch(() => undefined);

  try {
    const [foundUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!foundUser) {
      console.error(`No user found with email: ${email}`);
      process.exit(1);
    }

    const hashed = await hashPassword("password");

    const [existingAccount] = await db
      .select()
      .from(account)
      .where(and(eq(account.userId, foundUser.id), eq(account.providerId, "credential")))
      .limit(1);

    if (existingAccount) {
      const [updated] = await db
        .update(account)
        .set({ password: hashed })
        .where(eq(account.id, existingAccount.id))
        .returning();

      if (!updated) {
        throw new Error(`Failed to update credential account for user ${foundUser.id}`);
      }

      console.log(`Updated password for user ${foundUser.email} (account id: ${existingAccount.id})`);
    } else {
      const accountId = `${foundUser.id}-credential`;
      const [created] = await db
        .insert(account)
        .values({ id: accountId, userId: foundUser.id, providerId: "credential", accountId: foundUser.id, password: hashed })
        .returning();

      if (!created) {
        throw new Error(`Failed to create credential account for user ${foundUser.id}`);
      }

      console.log(`Created credential account and set password for user ${foundUser.email} (account id: ${accountId})`);
    }

    console.log("\nDone!");
  } catch (error) {
    console.error("Error setting password:", error);
    process.exit(1);
  }
}

main()
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectRedis().catch(() => undefined);
    await shutdownPostgres();
  });
