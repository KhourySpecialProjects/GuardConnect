import type { AnyRouter } from "@trpc/server";
import type { Express } from "express";
import log from "./logger.js";

export function registerTrpcUiRoute(
  app: Express,
  router: AnyRouter,
  apiPort: number,
) {
  app.get("/trpc-ui", async (_req, res) => {
    try {
      const { renderTrpcPanel } = await import("trpc-ui");

      const html = renderTrpcPanel(router, {
        url: `http://localhost:${apiPort}/api/trpc/`,
        meta: {
          title: "CommNG API",
          description: "API suite used in the CommNG Application",
        },
      });

      res.type("html").send(html);
    } catch (err) {
      log.error?.(err, "Failed to render tRPC UI");
      res.status(500).send("Failed to render tRPC UI");
    }
  });
}
