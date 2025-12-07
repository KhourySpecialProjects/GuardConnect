import z from "zod";
import notificationService from "../service/notification-service.js";
import { withErrorHandling } from "../trpc/error_handler.js";
import { protectedProcedure, router } from "../trpc/trpc.js";
import {
  type NotificationPayload,
  subscribeInputSchema,
} from "../types/notification-types.js";

const subscribe = protectedProcedure
  .input(subscribeInputSchema)
  .output(z.object({ success: z.boolean() }))
  .meta({
    openapi: {
      method: "POST",
      path: "/notifications.subscribe",
      summary: "Subscribe current user to web-push notifications",
      tags: ["Notifications"],
    },
  })
  .mutation(async ({ input, ctx }) => {
    return withErrorHandling("subscribeToNotifications", async () => {
      const userId = ctx.auth.user.id;

      await notificationService.subscribe(userId, input);
      return { success: true };
    });
  });

const testNotifications = protectedProcedure
  .output(z.object({ success: z.boolean() }))
  .meta({
    openapi: {
      method: "POST",
      path: "/notifications.testNotifications",
      summary: "Test by sending a sample notification",
      tags: ["Notifications"],
    },
  })
  .mutation(async () => {
    return withErrorHandling("testNotification", async () => {
      const payload: NotificationPayload = {
        title: "Test Notification",
        body: "This is a test and should go to every single subscriber",
      };

      await notificationService.sendNotifications("general", payload);
      return { success: true };
    });
  });

export const notificationsRouter = router({
  subscribe,
  testNotifications,
});
