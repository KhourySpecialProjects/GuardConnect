import { z } from "zod";
import { reportCategoryEnum } from "../data/db/schema.js";

export const reportCategorySchema = z.enum(reportCategoryEnum.enumValues);

export const reportAttachmentSchema = z.object({
  fileId: z.string(),
  fileName: z.string(),
});

export type ReportAttachmentRecord = z.infer<typeof reportAttachmentSchema>;

const userIdSchema = z
  .string()
  .min(1, "User identifier is required to submit reports.");

const reportSchema = z.object({
  attachments: z.array(reportAttachmentSchema),
  reportId: z.string(),
  category: reportCategorySchema.nullable(),
  title: z.string(),
  description: z.string(),
  status: z.enum(["Pending", "Assigned", "Resolved"]),
  submittedBy: z.string(),
  assignedTo: userIdSchema.nullable(),
  assignedBy: userIdSchema.nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  resolvedAt: z.date().nullable(),
});

export const getReportsInputSchema = z.object({
  name: userIdSchema,
});

export const getReportsOutputSchema = z.array(reportSchema);

export const assignReportInputSchema = z.object({
  reportId: z.uuid(),
  assigneeId: userIdSchema,
  assignedBy: userIdSchema,
});

export const assignReportOutputSchema = reportSchema;

export const unassignReportInputSchema = z.object({
  reportId: z.uuid(),
});

export const unassignReportOutputSchema = reportSchema;

export const createReportsInputSchema = z.object({
  category: reportCategorySchema.optional(),
  title: z.string().min(1, "Report title cannot be empty."),
  description: z.string().min(1, "Report description cannot be empty."),
  attachments: z.array(z.uuid()).max(10).default([]),
  submittedBy: userIdSchema,
  status: z.enum(["Pending", "Assigned", "Resolved"]).default("Pending"),
});

export const createReportsOutputSchema = reportSchema;

export const editReportSchema = z
  .object({
    reportId: z.uuid(),
    updates: z.object({
      category: reportCategorySchema.optional(),
      title: z.string().min(1).optional(),
      description: z.string().min(1).optional(),
      attachments: z.array(z.uuid()).max(10).optional(),
      status: z.enum(["Pending", "Assigned", "Resolved"]).optional(),
    }),
  })
  .refine(
    (data) => Object.values(data.updates).some((value) => value !== undefined),
    { message: "At least one field must be updated" },
  );

export const updateReportOutputSchema = reportSchema;

export const deleteReportSchema = z.object({
  reportId: z.uuid(),
  deletedBy: userIdSchema,
});

export type SendReportInput = z.infer<typeof getReportsInputSchema>;
export type AssignReport = z.infer<typeof assignReportInputSchema>;
export type CreateReport = z.infer<typeof createReportsInputSchema>;
export type EditReport = z.infer<typeof editReportSchema>;
export type DeleteReport = z.infer<typeof deleteReportSchema>;
