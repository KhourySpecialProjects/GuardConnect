import { z } from "zod";
import { CommsRepository } from "../data/repository/comms-repo.js";
import { channelRole } from "../data/roles.js";
import { fileService } from "../routers/files.js";
import { CommsService } from "../service/comms-service.js";
import { policyEngine } from "../service/policy-engine.js";
import { withErrorHandling } from "../trpc/error_handler.js";
import { ensureHasRole, protectedProcedure, router } from "../trpc/trpc.js";
import {
  createChannelOutputSchema,
  createChannelSchema,
  createSubscriptionOutputSchema,
  createSubscriptionSchema,
  deleteChannelOutputSchema,
  deleteChannelSchema,
  deletePostOutputSchema,
  deletePostSchema,
  deleteSubscriptionOutputSchema,
  deleteSubscriptionSchema,
  editPostOutputSchema,
  editPostSchema,
  getAllChannelsOutputSchema,
  getChannelMembersOutputSchema,
  getChannelMembersSchema,
  getChannelMessagesOutputSchema,
  getChannelMessagesSchema,
  getUserSubscriptionsOutputSchema,
  joinChannelSchema,
  leaveChannelSchema,
  postPostOutputSchema,
  postPostSchema,
  removeMemberSchema,
  toggleReactionOutputSchema,
  toggleReactionSchema,
  updateChannelOutputSchema,
  updateChannelSchema,
  updateSubscriptionOutputSchema,
  updateSubscriptionSchema,
} from "../types/comms-types.js";
import { ForbiddenError, InternalServerError } from "../types/errors.js";
import log from "../utils/logger.js";

const commsRepo = new CommsRepository();
const commsService = new CommsService(commsRepo);

/**
 * createPost
 * Allows an authenticated user to post a message in a channel if they have write permissions.
 */
const createPost = protectedProcedure
  .input(postPostSchema)
  .output(postPostOutputSchema)
  .meta({
    openapi: {
      method: "POST",
      path: "/comms.createPost",
      summary: "Create a new message in a channel",
      tags: ["Comms"],
    },
  })
  .mutation(async ({ ctx, input }) => {
    ensureHasRole(ctx, [channelRole("post", input.channelId)]);

    const userId = ctx.auth.user.id;
    await commsService.getChannelById(input.channelId);

    const createdPost = await commsService.createMessage(
      userId,
      input.channelId,
      input.content,
      input.attachmentFileIds,
    );

    return createdPost;
  });

/**
 * getAllChannels
 * Retrieves a list of all channels. (no matter if public or private?)
 */
const getAllChannels = protectedProcedure
  .output(getAllChannelsOutputSchema)
  .meta({
    openapi: {
      method: "POST",
      path: "/comms.getAllChannels",
      summary: "Gets all channels accessible to current user",
      tags: ["Comms"],
    },
  })
  .query(({ ctx }) =>
    withErrorHandling("getAllChannels", async () => {
      const userId = ctx.auth.user.id;

      log.debug({ userId }, "Getting accessible channels");

      return await commsRepo.getAccessibleChannels(userId);
    }),
  );

/**
 * getChannelMessages
 * Retrieves messages from a specific channel.
 */
const getChannelMessages = protectedProcedure
  .input(getChannelMessagesSchema)
  .output(getChannelMessagesOutputSchema)
  .meta({
    openapi: {
      method: "POST",
      path: "/comms.getChannelMessages",
      summary:
        "Gets messages from a specific channel with reaction information from other users",
      tags: ["Comms"],
    },
  })
  .query(async ({ ctx, input }) => {
    const userId = ctx.auth.user.id;

    // Verify the channel exists first
    await commsService.getChannelById(input.channelId);

    ensureHasRole(ctx, [channelRole("read", input.channelId)]);

    log.debug(
      { userId, channelId: input.channelId },
      "Getting channel messages",
    );

    return await commsRepo.getChannelMessages(input.channelId, userId);
  });

const toggleMessageReaction = protectedProcedure
  .input(toggleReactionSchema)
  .output(toggleReactionOutputSchema)
  .meta({
    openapi: {
      method: "POST",
      path: "/comms.toggleMessageReaction",
      summary: "Toggles a reaction on a message from the current user",
      tags: ["Comms"],
    },
  })
  .mutation(async ({ ctx, input }) => {
    ensureHasRole(ctx, [channelRole("read", input.channelId)]);
    const userId = ctx.auth.user.id;

    const message = await commsRepo.getMessageById(input.messageId);

    if (message.channelId !== input.channelId) {
      throw new ForbiddenError(
        "Message does not belong to the specified channel",
      );
    }

    const reactions = await commsRepo.setMessageReaction({
      messageId: input.messageId,
      userId,
      emoji: input.emoji,
      active: input.active,
    });

    return {
      messageId: input.messageId,
      reactions,
    };
  });

/**
 * editPost
 * Allows an authenticated user to edit a previously posted message if they authored it.
 */
const editPost = protectedProcedure
  .input(editPostSchema)
  .output(editPostOutputSchema)
  .meta({
    openapi: {
      method: "POST",
      path: "/comms.editPost",
      summary:
        "Edits a previously posted message if the current user is the author",
      tags: ["Comms"],
    },
  })
  .mutation(async ({ ctx, input }) => {
    ensureHasRole(ctx, [channelRole("post", input.channelId)]);
    const userId = ctx.auth.user.id;

    const updatedPost = await commsService.editMessage(
      userId,
      input.channelId,
      input.messageId,
      input.content,
      input.attachmentFileIds,
    );

    return updatedPost;
  });

/**
 * deletePost
 * Allows an authenticated user to delete a previously posted message if they authored it or if they are an admin.
 */
const deletePost = protectedProcedure
  .input(deletePostSchema)
  .output(deletePostOutputSchema)
  .meta({
    openapi: {
      method: "POST",
      path: "/comms.deletePost",
      summary:
        "Deletes a previously posted message if the current user is the author or an admin",
      tags: ["Comms"],
    },
  })
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.auth.user.id;

    const deletedPost = await commsService.deleteMessage(
      userId,
      input.channelId,
      input.messageId,
      fileService,
    );

    return deletedPost;
  });

// Channel creation endpoint
const createChannel = protectedProcedure
  .input(createChannelSchema)
  .output(createChannelOutputSchema)
  .meta({
    openapi: {
      method: "POST",
      path: "/comms.createChannel",
      summary: "Creates a new channel with the current user as the admin",
      tags: ["Comms"],
    },
  })
  .mutation(({ ctx, input }) =>
    withErrorHandling("createChannel", async () => {
      const userId = ctx.auth.user.id;

      log.debug({ userId, channelName: input.name }, "Creating channel");

      const channelCreationResult = await commsRepo.createChannel(
        input.name,
        input.metadata,
        input.postingPermissions,
      );
      if (!channelCreationResult || !channelCreationResult.channelId) {
        throw new InternalServerError("Something went wrong creating channel");
      }

      // Create admin role and assign it to the channel creator
      const roleKey = channelRole("admin", channelCreationResult.channelId);
      await policyEngine.createAndAssignChannelRole(
        userId,
        userId,
        roleKey,
        "admin",
        "channel",
        channelCreationResult.channelId,
      );

      // Auto-subscribe the creator with notifications enabled
      await commsRepo.ensureChannelSubscription(
        userId,
        channelCreationResult.channelId,
      );

      return channelCreationResult;
    }),
  );

// update channel settings
const updateChannelSettings = protectedProcedure
  .input(updateChannelSchema)
  .output(updateChannelOutputSchema)
  .meta({
    openapi: {
      method: "POST",
      path: "/comms.updateChannelSettings",
      summary: "Updates the settings of a channel",
      tags: ["Comms"],
    },
  })
  .mutation(({ ctx, input }) =>
    withErrorHandling("updateChannel", async () => {
      ensureHasRole(ctx, [channelRole("admin", input.channelId)]);
      return await commsService.updateChannelSettings(
        input.metadata.name,
        input.channelId,
        input.metadata.description,
        input.metadata,
      );
    }),
  );

// Channel members endpoint
const getChannelMembers = protectedProcedure
  .input(getChannelMembersSchema)
  .output(getChannelMembersOutputSchema)
  .meta({
    openapi: {
      method: "POST",
      path: "/comms.getChannelMembers",
      summary: "Gets the members of a channel with their roles",
      tags: ["Comms"],
    },
  })
  .query(({ input }) =>
    withErrorHandling("getChannelMembers", async () => {
      log.debug({ channelId: input.channelId }, "getChannelMembers");
      return await commsRepo.getChannelMembers(input.channelId);
    }),
  );

// Channel subscription endpoints
const createSubscription = protectedProcedure
  .input(createSubscriptionSchema)
  .output(createSubscriptionOutputSchema)
  .meta({
    openapi: {
      method: "POST",
      path: "/comms.createSubscription",
      summary:
        "Creates a new subscription for the current user for the given channel",
      tags: ["Comms"],
    },
  })
  .mutation(({ ctx, input }) =>
    withErrorHandling("createSubscription", async () => {
      const userId = ctx.auth.user.id;

      log.debug(
        { userId, channelId: input.channelId },
        "Creating subscription",
      );

      return await commsRepo.createSubscription(
        userId,
        input.channelId,
        input.notificationsEnabled,
      );
    }),
  );

const deleteSubscription = protectedProcedure
  .input(deleteSubscriptionSchema)
  .output(deleteSubscriptionOutputSchema)
  .meta({
    openapi: {
      method: "POST",
      path: "/comms.deleteSubscription",
      summary:
        "Deletes a subscription for the current user for the given channel if they are the subscriber",
      tags: ["Comms"],
    },
  })
  .mutation(({ ctx, input }) =>
    withErrorHandling("deleteSubscription", async () => {
      const userId = ctx.auth.user.id;

      log.debug(
        { userId, subscriptionId: input.subscriptionId },
        "Deleting subscription",
      );

      return await commsRepo.deleteSubscription(input.subscriptionId, userId);
    }),
  );

const getUserSubscriptions = protectedProcedure
  .output(getUserSubscriptionsOutputSchema)
  .meta({
    openapi: {
      method: "POST",
      path: "/comms.getUserSubscriptions",
      summary: "Gets the subscriptions of the current user",
      tags: ["Comms"],
    },
  })
  .query(({ ctx }) =>
    withErrorHandling("getUserSubscriptions", async () => {
      const userId = ctx.auth.user.id;

      log.debug({ userId }, "Getting user subscriptions");

      return await commsRepo.getUserSubscriptions(userId);
    }),
  );

const updateSubscriptionSettings = protectedProcedure
  .input(updateSubscriptionSchema)
  .output(updateSubscriptionOutputSchema)
  .meta({
    openapi: {
      method: "POST",
      path: "/comms.updateSubscriptionSettings",
      summary: "Updates the settings of a subscription for the current user",
      tags: ["Comms"],
    },
  })
  .mutation(({ input }) =>
    withErrorHandling("updateSubscription", async () => {
      return await commsService.updateSubscriptionSettings(
        input.channelId,
        input.userId,
        input.notificationsEnabled,
      );
    }),
  );

// Delete channel endpoint (admin only)
const deleteChannel = protectedProcedure
  .input(deleteChannelSchema)
  .output(deleteChannelOutputSchema)
  .meta({
    openapi: {
      method: "POST",
      path: "/comms.deleteChannel",
      summary: "Deletes a channel if the current user is the admin",
      tags: ["Comms"],
    },
  })
  .mutation(({ ctx, input }) =>
    withErrorHandling("deleteChannel", async () => {
      const userId = ctx.auth.user.id;

      log.debug({ userId, channelId: input.channelId }, "Deleting channel");

      return await commsService.deleteChannel(userId, input.channelId);
    }),
  );

// Leave channel endpoint (non-admin only)
const leaveChannel = protectedProcedure
  .input(leaveChannelSchema)
  .output(z.object({ success: z.boolean() }))
  .meta({
    openapi: {
      method: "POST",
      path: "/comms.leaveChannel",
      summary: "Leaves a channel if the current user is a member",
      tags: ["Comms"],
    },
  })
  .mutation(({ ctx, input }) =>
    withErrorHandling("leaveChannel", async () => {
      const userId = ctx.auth.user.id;

      log.debug({ userId, channelId: input.channelId }, "Leaving channel");

      return await commsService.leaveChannel(userId, input.channelId);
    }),
  );

// Join channel endpoint (public channels only)
const joinChannel = protectedProcedure
  .input(joinChannelSchema)
  .output(z.object({ success: z.boolean(), channelId: z.number() }))
  .meta({
    openapi: {
      method: "POST",
      path: "/comms.joinChannel",
      summary: "Joins a channel if the current user is not a member",
      tags: ["Comms"],
    },
  })
  .mutation(({ ctx, input }) =>
    withErrorHandling("joinChannel", async () => {
      const userId = ctx.auth.user.id;

      log.debug({ userId, channelId: input.channelId }, "Joining channel");

      return await commsService.joinChannel(userId, input.channelId);
    }),
  );

// Remove member endpoint (admin only)
const removeMember = protectedProcedure
  .input(removeMemberSchema)
  .output(z.object({ success: z.boolean() }))
  .meta({
    openapi: {
      method: "POST",
      path: "/comms.removeMember",
      summary:
        "Removes a member from a channel if the current user is the admin",
      tags: ["Comms"],
    },
  })
  .mutation(({ ctx, input }) =>
    withErrorHandling("removeMember", async () => {
      const userId = ctx.auth.user.id;

      log.debug(
        { userId, targetUserId: input.userId, channelId: input.channelId },
        "Removing member from channel",
      );

      return await commsService.removeUserFromChannel(
        userId,
        input.channelId,
        input.userId,
      );
    }),
  );

export const commsRouter = router({
  createPost,
  getAllChannels,
  getChannelMessages,
  toggleMessageReaction,
  editPost,
  deletePost,
  createChannel,
  updateChannelSettings,
  getChannelMembers,
  createSubscription,
  deleteSubscription,
  getUserSubscriptions,
  updateSubscriptionSettings,
  deleteChannel,
  leaveChannel,
  joinChannel,
  removeMember,
});
