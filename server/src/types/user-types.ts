import { z } from "zod";

export const getUserDataInputSchema = z.object({
  user_id: z.number(),
});

export type GetUserDataInput = z.infer<typeof getUserDataInputSchema>;

export type RoleNamespace = "global" | "channel" | "mentor" | "feature";
export type RoleSummary = {
  roleId: number;
  namespace: RoleNamespace;
  subjectId: string | null;
  action: string;
  roleKey: string;
  channelId: number | null;
  metadata: Record<string, unknown> | null;
};

export type GetUserDataOutput = {
  userId: number;
  name: string;
  email: string;
  phoneNumber?: string | null;
  clearanceLevel?: string | null;
  department?: string | null;
  branch?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};
