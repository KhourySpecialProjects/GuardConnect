import { generateOpenApiDocument } from "trpc-to-openapi";
import * as packageJson from "../../package.json" with { type: "json" };
import { appRouter } from "./app_router.js";

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: "GuardConnect API",
  baseUrl: `${process.env.BACKEND_URL ?? "http://localhost:3200"}/api/openapi`,
  version: packageJson.default.version,
});
