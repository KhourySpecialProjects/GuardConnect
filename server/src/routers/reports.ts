import { TRPCError } from "@trpc/server";
import { ReportService } from "../service/reports-service.js";
import { procedure, router } from "../trpc/trpc.js";
import { getReportsSchema } from "../types/reports-types.js";
import log from "../utils/logger.js";

const reportService = new ReportService();

export const reportsRouter = router({
  getReports: procedure
    .input(getReportsSchema)
    .meta({ requiresAuth: true, description: "Returns the list of reports" })
    .mutation(async ({ input }) => {
      try {
        return await reportService.getHelloWorld(input.name);
      } catch (error) {
        log.error(error, "getReports failed");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to getReports",
          cause: error,
        });
      }
    }),
});
