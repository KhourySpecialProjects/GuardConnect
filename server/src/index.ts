import path from "node:path";
import { fileURLToPath } from "node:url";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import { auth } from "./auth.js";
import { connectRedis } from "./data/db/redis.js";
import { connectPostgres } from "./data/db/sql.js";
import { policyEngine } from "./service/policy-engine.js";
import { appRouter } from "./trpc/app_router.js";
import { createContext } from "./trpc/trpc.js";
import log from "./utils/logger.js";

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(
  cors({
    // Allow the request origin (works for same-origin serving and local dev).
    // We keep credentials: true to allow auth cookies.
    origin: true,
    credentials: true, // allow cookies/authorization headers
  }),
);

// Ensure JSON bodies are parsed before tRPC middleware. Some clients or proxies
// may send a request body that would otherwise not be parsed; adding express.json
// helps surface malformed or missing payloads early and avoids an empty method
// being passed into tRPC which results in "No procedure found on path \"\"".
app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", toNodeHandler(auth));

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

// Serve the static docs site (so you can open http://localhost:3000/ and avoid
// dealing with cross-origin requests). Place this after API mounts so that
// /api/* routes are handled by Express/tRPC first.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const docsDir = path.resolve(__dirname, "..", "..", "docs");

app.use(express.static(docsDir));

// For any non-API GET request, serve the docs index.html so client-side apps
// using HTML5 history routing will work.
app.get("/", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(docsDir, "index.html"));
});

await connectPostgres();
await connectRedis();
await policyEngine.populateCache(60 * 60 * 12, 5000);

app.listen(port, () => {
  log.info(`tRPC server running at http://localhost:${port}/api/trpc`);
  log.info(`Better auth running at http://localhost:${port}/api/auth`);
  log.info(
    `Better-auth OpenAPI spec: http://localhost:${port}/api/auth/reference`,
  );
});
