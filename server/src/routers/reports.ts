import z from "zod";
import { ReportRepository } from "../data/repository/reports-repo.js";
import { reportingRole } from "../data/roles.js";
import { PolicyEngine } from "../service/policy-engine.js";
import { ReportService } from "../service/reports-service.js";
import { withErrorHandling } from "../trpc/error_handler.js";
import { roleProcedure, router } from "../trpc/trpc.js";
import {
  assignReportInputSchema,
  assignReportOutputSchema,
  createReportsInputSchema,
  createReportsOutputSchema,
  deleteReportSchema,
  editReportSchema,
  getReportsInputSchema,
  getReportsOutputSchema,
  unassignReportInputSchema,
  unassignReportOutputSchema,
  updateReportOutputSchema,
} from "../types/reports-types.js";

const reportService = new ReportService(new ReportRepository());
const ADMIN_REPORT_ROLES = [reportingRole("admin"), reportingRole("assign")];

const getReports = roleProcedure([reportingRole("read")])
  .input(getReportsInputSchema)
  .output(getReportsOutputSchema)
  .meta({
    openapi: {
      method: "POST",
      path: "/reports.getReports",
      summary: "Returns the list of reports",
      tags: ["Reports"],
    },
  })
  .query(({ ctx, input }) =>
    withErrorHandling("getReports", () => {
      const roleSet = ctx.roles ?? new Set();
      const canViewAll = PolicyEngine.validateList(roleSet, ADMIN_REPORT_ROLES);

      if (canViewAll) {
        return reportService.getAllReports();
      }

      return reportService.getReportsForUser(input.name);
    }),
  );

const createReport = roleProcedure([reportingRole("create")])
  .input(createReportsInputSchema)
  .output(createReportsOutputSchema)
  .meta({
    openapi: {
      method: "POST",
      path: "/reports.createReport",
      summary: "Creates a new report",
      tags: ["Reports"],
    },
  })
  .mutation(({ input }) =>
    withErrorHandling("createReport", () => reportService.createReport(input)),
  );

const updateReport = roleProcedure([reportingRole("update")])
  .input(editReportSchema)
  .output(updateReportOutputSchema)
  .meta({
    openapi: {
      method: "POST",
      path: "/reports.updateReport",
      summary: "Updates an existing report",
      tags: ["Reports"],
    },
  })
  .mutation(({ input }) =>
    withErrorHandling("updateReport", () =>
      reportService.updateReport(input.reportId, input.updates),
    ),
  );

const deleteReport = roleProcedure([reportingRole("delete")])
  .input(deleteReportSchema)
  .output(z.object({ reportId: z.string() }).optional())
  .meta({
    openapi: {
      method: "POST",
      path: "/reports.deleteReport",
      summary: "Deletes a report",
      tags: ["Reports"],
    },
  })
  .mutation(({ input }) =>
    withErrorHandling("deleteReport", () =>
      reportService.deleteReport(input.reportId, input.deletedBy),
    ),
  );

const assignReport = roleProcedure([reportingRole("assign")])
  .input(assignReportInputSchema)
  .output(assignReportOutputSchema)
  .meta({
    openapi: {
      method: "POST",
      path: "/reports.assignReport",
      summary: "Assigns a report to a user",
      tags: ["Reports"],
    },
  })
  .mutation(({ input }) =>
    withErrorHandling("assignReport", () => reportService.assignReport(input)),
  );

const unassignReport = roleProcedure([reportingRole("assign")])
  .input(unassignReportInputSchema)
  .output(unassignReportOutputSchema)
  .meta({
    openapi: {
      method: "POST",
      path: "/reports.unassignReport",
      summary: "Unassigns a report from a user",
      tags: ["Reports"],
    },
  })
  .mutation(({ input }) =>
    withErrorHandling("unassignReport", () =>
      reportService.unassignReport(input.reportId),
    ),
  );

export const reportsRouter = router({
  getReports,
  createReport,
  updateReport,
  deleteReport,
  assignReport,
  unassignReport,
});
