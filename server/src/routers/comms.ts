import { z } from "zod";
import { userDevices } from "../data/db/schema/index.js";
import { db } from "../data/db/sql.js";
import { CommsService } from "../service/comms-service.js";
import { policyEngine } from "../service/policy-engine.js";
import { procedure, router } from "../trpc/trpc.js";
import { postPostSchema } from "../types/comms-types.js";
import { ForbiddenError, UnauthorizedError } from "../types/errors.js";
import log from "../utils/logger.js";

const commsService = new CommsService();

const ping = procedure.query(() => {
  log.debug("ping");
  return "pong from comms";
});

const registerDevice = procedure
  .input(
    z.object({
      deviceType: z.string(),
      deviceToken: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    log.debug("registerDevice", { deviceType: input.deviceType });

    const [device] = await db
      .insert(userDevices)
      .values({
        userId: 1, // TODO: get from auth context
        deviceType: input.deviceType,
        deviceToken: input.deviceToken,
      })
      .returning();

    return device;
/**
 * createPost
 * Allows an authenticated user to post a message in a channel if they have write permissions.
 */
const createPost = procedure
  .input(postPostSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId ?? ctx.user?.userId ?? null;
    if (!userId) {
      throw new UnauthorizedError("Sign in required");
    }

    await commsService.getChannelById(input.channelId);

    const canPost = await policyEngine.validate(
      userId,
      `channel:${input.channelId}:post`,
    );

    if (!canPost) {
      throw new ForbiddenError(
        "You do not have permission to post in this channel",
      );
    }

    const createdPost = commsService.createMessage(
      userId,
      input.channelId,
      input.content,
      input.attachmentUrl,
    );

    return createdPost;
  });

export const commsRouter = router({
  ping,
  registerDevice,
  createPost,
});
