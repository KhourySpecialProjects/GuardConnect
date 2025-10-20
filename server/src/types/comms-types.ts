import { z } from "zod";

export const postPostSchema = z.object({
  channelId: z.coerce.number().int().positive(),
  content: z.string().min(1, "Post content cannot be empty"),
  attachmentUrl: z.string().url().optional(),
});

export const editPostSchema = z.object({
  channelId: z.coerce.number().int().positive(),
  messageId: z.coerce.number().int().positive(),
  content: z.string().min(1, "Post content cannot be empty"),
  attachmentUrl: z.string().url().optional(),
});
export const registerDeviceSchema = z.object({
  deviceType: z.string(),
  deviceToken: z.string(),
});

export type RegisterDeviceInput = z.infer<typeof registerDeviceSchema>;
