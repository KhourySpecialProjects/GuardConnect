import { createClient } from "redis";
import log from "../../utils/logger.js";

// Build Redis URL from environment variables
const buildRedisUrl = () => {
  const url = process.env.REDIS_URL;
  if (url) return url;

  const host = process.env.REDIS_HOST ?? "localhost";
  const port = process.env.REDIS_PORT ?? "6379";
  const username = process.env.REDIS_USERNAME ?? "default";
  const password = process.env.REDIS_PASSWORD ?? "";

  // Only include password in URL if it's provided
  if (password) {
    return `redis://${username}:${password}@${host}:${port}`;
  }
  return `redis://${host}:${port}`;
};

const redisUrl = buildRedisUrl();
const password = process.env.REDIS_PASSWORD ?? "";

export const redisClient = createClient({
  url: redisUrl,
  password: password,
});

redisClient.on("error", (err) => {
  log.error(err, "Redis Client Error:");
});

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    log.info("Redis Client connection established");
  }
};

export const disconnectRedis = async () => {
  if (redisClient.isOpen) {
    await redisClient.quit();
    log.info("Redis Client disconnected");
  }
};
