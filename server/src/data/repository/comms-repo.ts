import { and, eq } from "drizzle-orm";
import { ConflictError, NotFoundError } from "../../types/errors.js";
import { channels, messages } from "../db/schema/index.js";
import { db } from "../db/sql.js";

export type UserPermissionsResult = {
  canPost: boolean;
  subscriptionPermission: string | null;
  hasDirectRolePermission: boolean;
  hasMessageRolePermission: boolean;
};

export class CommsRepository {
  async getChannelById(channel_id: number) {
    const [channel] = await db
      .select({ id: channels.channelId })
      .from(channels)
      .where(eq(channels.channelId, channel_id))
      .limit(1);

    if (!channel) {
      throw new NotFoundError("Channel not found");
    }

    return channel;
  }

  async createMessage(
    user_id: number,
    channel_id: number,
    content: string,
    attachment_url?: string,
  ) {
    const [created] = await db
      .insert(messages)
      .values({
        channelId: channel_id,
        senderId: user_id,
        message: content,
        attachmentUrl: attachment_url,
      })
      .returning({
        messageId: messages.messageId,
        channelId: messages.channelId,
        senderId: messages.senderId,
        message: messages.message,
        attachmentUrl: messages.attachmentUrl,
        createdAt: messages.createdAt,
      });

    if (!created) {
      throw new ConflictError("Message post failed!");
    }

    return created;
  }

  async getMessageById(message_id: number) {
    const [message] = await db
      .select({
        messageId: messages.messageId,
        channelId: messages.channelId,
        senderId: messages.senderId,
        message: messages.message,
        attachmentUrl: messages.attachmentUrl,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(eq(messages.messageId, message_id))
      .limit(1);

    if (!message) {
      throw new NotFoundError("Message not found");
    }

    return message;
  }

  async updateMessage(
    message_id: number,
    channel_id: number,
    content: string,
    attachment_url?: string,
  ) {
    const [updated] = await db
      .update(messages)
      .set({
        message: content,
        attachmentUrl: attachment_url ?? null,
      })
      .where(
        and(
          eq(messages.messageId, message_id),
          eq(messages.channelId, channel_id),
        ),
      )
      .returning({
        messageId: messages.messageId,
        channelId: messages.channelId,
        senderId: messages.senderId,
        message: messages.message,
        attachmentUrl: messages.attachmentUrl,
        createdAt: messages.createdAt,
      });

    if (!updated) {
      throw new ConflictError("Message update failed!");
    }

    return updated;
  }
}
