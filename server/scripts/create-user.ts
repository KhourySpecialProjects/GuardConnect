import { auth } from "../src/auth.js";
import { connectPostgres, db, shutdownPostgres } from "../src/data/db/sql.js";
import { users } from "../src/data/db/schema.js";
import { eq } from "drizzle-orm";

/**
 * Script to create a new user account using better-auth
 *
 * Edit the userData object below with the user details you want to create.
 *
 * Usage:
 *   cd server
 *   npx tsx --env-file=.env scripts/create-user.ts
 */

async function createUser() {
  // Ensure the DB pool is connected (uses Secrets Manager if enabled)
  await connectPostgres();
  // Edit this object to create a new user
  const userData = {
    email: "basic2@basic.basic",
    password: "password",
    name: "U2",
    phoneNumber: "555-123-1234", // optional
    rank: "Captain", // optional
    department: "Engineering", // optional
    branch: "Army", // optional
    positionType: "active",
    civilianCareer: "Engineering Manager",
    signalVisibility: "public",
    emailVisibility: "public",
    interests: '"Engineering, Technology"',
    location: "Boston",
    about: "I am an engineer with a passion for technology.",
  };

  console.log("Creating user with the following details:");
  console.log(`  Email: ${userData.email}`);
  console.log(`  Name: ${userData.name}`);
  if (userData.phoneNumber) console.log(`  Phone: ${userData.phoneNumber}`);
  if (userData.rank) console.log(`  Rank: ${userData.rank}`);
  if (userData.department) console.log(`  Department: ${userData.department}`);
  if (userData.branch) console.log(`  Branch: ${userData.branch}`);
  console.log("");

  try {
    // Use better-auth's internal API to create the user
    // Note: We exclude enum fields (positionType, signalVisibility, emailVisibility)
    // because better-auth wraps them in objects when validators are present
    const result = await auth.api.signUpEmail({
      body: {
        email: userData.email.toLowerCase().trim(),
        password: userData.password,
        name: userData.name.trim(),
        phoneNumber: userData.phoneNumber,
        rank: userData.rank,
        department: userData.department,
        branch: userData.branch,
        positionType: userData.positionType,
        civilianCareer: userData.civilianCareer,
        signalVisibility: userData.signalVisibility,
        emailVisibility: userData.emailVisibility,
        location: userData.location,
        about: userData.about,
      },
    });

    if (!result || "error" in result) {
      console.error("Failed to create user:");
      console.error(result);
      process.exit(1);
    }

    console.log("✓ Successfully created user!");
    // Update enum fields separately to avoid better-auth wrapping them in objects
    await db
      .update(users)
      .set({
        positionType: userData.positionType as "active" | "part-time",
        signalVisibility: userData.signalVisibility as "private" | "public",
        emailVisibility: userData.emailVisibility as "private" | "public",
        interests: userData.interests ? JSON.parse(userData.interests) : [],
      })
      .where(eq(users.id, result.user.id));

    console.log(`  User ID: ${result.user.id}`);
    console.log(`  Email: ${result.user.email}`);
    console.log(`  Name: ${result.user.name}`);
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

createUser()
  .then(() => {
    console.log("\nDone!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nFailed to create user:", error);
    process.exit(1);
  })
  .finally(async () => {
    await shutdownPostgres();
  });
