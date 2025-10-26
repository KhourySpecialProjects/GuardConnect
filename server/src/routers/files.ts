import { TRPCError } from "@trpc/server";
import { FileRepository } from "../data/repository/file-repo.js";
import { FileService } from "../service/file-service.js";
import { policyEngine } from "../service/policy-engine.js";
import { FileSystemStorageAdapter } from "../storage/filesystem-adapter.js";
import { procedure, protectedProcedure, router } from "../trpc/trpc.js";
import { ForbiddenError } from "../types/errors.js";
import type { FileDownloadPayload } from "../types/file-types.js";
import {
  getFileInputSchema,
  uploadForChannelInputSchema,
  uploadForUserInputSchema,
} from "../types/file-types.js";
import log from "../utils/logger.js";
import { S3StorageAdapter } from "../storage/s3-adapter.js";

// Choose adapter based on environment. If S3_BUCKET_NAME is set, use S3 adapter;
// otherwise fall back to filesystem for local/dev.
const adapter = process.env.S3_BUCKET_NAME
  ? new S3StorageAdapter({
      bucket: process.env.S3_BUCKET_NAME!,
      region: process.env.AWS_REGION,
      publicBaseUrl: `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com`,
    })
  : new FileSystemStorageAdapter();

const fileService = new FileService(new FileRepository(), adapter);

const uploadForUser = protectedProcedure
  .input(uploadForUserInputSchema)
  .meta({
    requiresAuth: true,
    description: "Upload a user-specific file (profile picture, etc.)",
  })
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.auth.user.id;

    const { file, contentType } = input;
      // If using S3 and presigned uploads are enabled, return an upload URL rather
      // than consuming the file stream on the server.
      if (process.env.S3_BUCKET_NAME && process.env.USE_PRESIGNED_UPLOADS === "true") {
        const originalName = file?.name ?? "file";
        try {
          const { fileId, uploadUrl } = await fileService.createPresignedUpload(
            userId,
            originalName,
            { contentType: contentType ?? "application/octet-stream" },
            Number(process.env.PRESIGN_EXPIRY_SECONDS) || undefined,
          );
          return { fileId, uploadUrl };
        } catch (err) {
          log.error(err, "Presigned upload creation failed");
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create upload URL" });
        }
      }

      const stream = await fileService.fileLikeToReadable(file);
      try {
        const fileId = await fileService.storeFileFromStream(
          userId,
          file.name,
          stream,
          { contentType: contentType ?? "application/octet-stream" },
        );
        return { fileId };
      } catch (err) {
      log.error(err, "File upload failed");
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to store file",
      });
    }
  });

const uploadForChannel = protectedProcedure
  .input(uploadForChannelInputSchema)
  .meta({
    requiresAuth: true,
    description:
      "Upload a channel-specific file (post attachment, cover photo, etc.)",
  })
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.auth.user.id;

    const { file, channelId, action, contentType } = input;

    const allowed = await policyEngine.validate(
      userId,
      `channel:${channelId}:${action}`,
    );
    if (!allowed) {
      throw new ForbiddenError(
        `No ${action} permission for channel ${channelId}`,
      );
    }

    const stream = await fileService.fileLikeToReadable(file);
    const resolvedContentType =
      contentType ?? file.type ?? "application/octet-stream";
    // If S3 presigned flow is enabled, create presigned upload and return it.
    if (process.env.S3_BUCKET_NAME && process.env.USE_PRESIGNED_UPLOADS === "true") {
      const originalName = file?.name ?? "file";
      try {
        const { fileId, uploadUrl } = await fileService.createPresignedUpload(
          userId,
          originalName,
          { contentType: resolvedContentType },
          Number(process.env.PRESIGN_EXPIRY_SECONDS) || undefined,
        );
        return { fileId, uploadUrl };
      } catch (err) {
        log.error(err, "Presigned upload creation failed");
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create upload URL" });
      }
    }

    try {
      const fileId = await fileService.storeFileFromStream(
        userId,
        file.name,
        stream,
        { contentType: resolvedContentType },
      );
      return { fileId };
    } catch (err) {
      log.error(err, "Channel file upload failed");
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to store file",
      });
    }
  });

const getFile = procedure
  .input(getFileInputSchema)
  .meta({ requiresAuth: true, description: "Get a file from its UUID" })
  .query(async ({ input }) => {
    try {
      const fileData = await fileService.getFileStream(input.fileId);
      if (!fileData) {
        throw new TRPCError({ code: "NOT_FOUND", message: "File not found" });
      }

      // If the stored location is already a public URL (S3) use it directly.
      // Otherwise, ask the adapter to produce a URL for the stored location.
      let url: string;
      const location = fileData.location;
      if (typeof location === "string" && (location.startsWith("http://") || location.startsWith("https://"))) {
        url = location;
      } else {
        url = await fileService.adapter.getUrl(location);
      }

      const payload: FileDownloadPayload = {
        fileName: fileData.fileName,
        contentType: fileData.contentType ?? "application/octet-stream",
        data: url,
      };

      return payload;
    } catch (err) {
      log.error(err, "File retrieval failed");
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve file",
      });
    }
  });


export const filesRouter = router({
  uploadForUser,
  uploadForChannel,
  getFile,
});
