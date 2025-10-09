import { z } from "zod";

export const getReportsSchema = z.object({
  name: z.string(),
});

export type SendReportInput = z.infer<typeof getReportsSchema>;
