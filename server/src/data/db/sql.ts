import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import log from "@/utils/logger.js";
import { secretsManager } from "@/utils/secrets-manager.js";

/**
 * Get database configuration from environment or Secrets Manager
 */
function getPoolConfig(): PoolConfig {
  return {
    host: process.env.POSTGRES_HOST ?? "localhost",
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    database: process.env.POSTGRES_DB ?? "comm_ng",
    user: process.env.POSTGRES_USER ?? "postgres",
    password: process.env.POSTGRES_PASSWORD ?? "",
    ssl:
      process.env.POSTGRES_SSL === "true"
        ? { rejectUnauthorized: false }
        : false,
    max: Number(process.env.POSTGRES_POOL_SIZE ?? 20),
  };
}

export let pool = new Pool(getPoolConfig());

pool.on("error", (err) => {
  log.error(err, "Postgres error");
});

export let db = drizzle(pool);

/**
 * Refresh database connection with new credentials
 * Called when secret rotation is detected
 */
async function refreshDatabaseConnection(credentials: {
  username: string;
  password: string;
}): Promise<void> {
  log.info("Refreshing database connection with rotated credentials");

  try {
    // Create new pool with updated credentials from Secrets Manager
    // Connection details (host, port, database) come from environment variables
    const newPool = new Pool({
      host: process.env.POSTGRES_HOST ?? "localhost",
      port: Number(process.env.POSTGRES_PORT ?? 5432),
      database: process.env.POSTGRES_DB ?? "comm_ng",
      user: credentials.username,
      password: credentials.password,
      ssl:
        process.env.POSTGRES_SSL === "true"
          ? { rejectUnauthorized: false }
          : false,
      max: Number(process.env.POSTGRES_POOL_SIZE ?? 20),
    });

    newPool.on("error", (err) => {
      log.error(err, "Postgres error");
    });

    // Test the new connection
    const testClient = await newPool.connect();
    testClient.release();

    // Close old pool gracefully
    const oldPool = pool;
    pool = newPool;
    db = drizzle(newPool);

    // Allow existing queries to complete before closing
    setTimeout(async () => {
      await oldPool.end();
      log.info("Old database pool closed");
    }, 30000); // 30 second grace period

    log.info("Database connection successfully refreshed with new credentials");
  } catch (error) {
    log.error(error, "Failed to refresh database connection");
    throw error;
  }
}

export async function connectPostgres() {
  // If Secrets Manager is enabled, fetch credentials and set up auto-refresh
  if (secretsManager.isEnabled()) {
    try {
      const credentials = await secretsManager.getCredentials();

      if (credentials) {
        log.info("Using credentials from AWS Secrets Manager");

        // Update pool with fetched credentials from Secrets Manager
        // Connection details (host, port, database) always come from environment variables
        await pool.end();
        pool = new Pool({
          host: process.env.POSTGRES_HOST ?? "localhost",
          port: Number(process.env.POSTGRES_PORT ?? 5432),
          database: process.env.POSTGRES_DB ?? "comm_ng",
          user: credentials.username,
          password: credentials.password,
          ssl:
            process.env.POSTGRES_SSL === "true"
              ? { rejectUnauthorized: false }
              : false,
          max: Number(process.env.POSTGRES_POOL_SIZE ?? 20),
        });

        pool.on("error", (err) => {
          log.error(err, "Postgres error");
        });

        db = drizzle(pool);

        // Start auto-refresh (check every 5 minutes by default)
        const refreshIntervalMs = Number(
          process.env.DB_SECRET_REFRESH_INTERVAL_MS ?? 5 * 60 * 1000,
        );
        await secretsManager.startAutoRefresh(
          refreshIntervalMs,
          refreshDatabaseConnection,
        );

        log.info("Database secret auto-refresh enabled");
      }
    } catch (error) {
      log.warn(
        {
          errorMessage: error instanceof Error ? error.message : String(error),
          errorName: error instanceof Error ? error.name : "Unknown",
        },
        "Failed to initialize Secrets Manager, falling back to environment variables",
      );
    }
  }

  // Test connection
  const client = await pool.connect();
  client.release();
  log.info("Postgres connection established");
}

export async function shutdownPostgres() {
  if (secretsManager.isEnabled()) {
    secretsManager.stopAutoRefresh();
  }
  await pool.end();
  log.info("Postgres shut down");
}
