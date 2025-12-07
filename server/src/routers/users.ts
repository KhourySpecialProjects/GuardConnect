import { z } from "zod";
import { AuthRepository } from "../data/repository/auth-repo.js";
import { InviteCodeRepository } from "../data/repository/invite-code-repo.js";
import { UserRepository } from "../data/repository/user-repo.js";
import { InviteCodeService } from "../service/invite-code-service.js";
import { UserService } from "../service/user-service.js";
import { withErrorHandling } from "../trpc/error_handler.js";
import { procedure, protectedProcedure, router } from "../trpc/trpc.js";
import {
  checkEmailExistsInputSchema,
  createUserInputSchema,
  createUserOutputSchema,
  createUserProfileInputSchema,
  getUserDataInputSchema,
  getUserRolesOutputSchema,
  getUsersByIdsInputSchema,
  searchUsersInputSchema,
  searchUsersOutputSchema,
  updateUserProfileInputSchema,
  updateUserVisibilityInputSchema,
  userDataOutputSchema,
  userSchema,
} from "../types/user-types.js";

const authRepository = new AuthRepository();
const userService = new UserService(
  new UserRepository(),
  new InviteCodeService(new InviteCodeRepository(), authRepository),
);

const getUserData = protectedProcedure
  .input(getUserDataInputSchema)
  .output(userDataOutputSchema)
  .meta({
    openapi: {
      method: "POST",
      path: "/user.getUserData",
      summary: "Returns the public-facing data for a given user",
      tags: ["Users"],
    },
  })
  .query(async ({ input }) => {
    return withErrorHandling("getUserData", async () => {
      return await userService.getUserData(input.user_id);
    });
  });

const checkEmailExists = procedure
  .input(checkEmailExistsInputSchema)
  .output(z.boolean())
  .meta({
    openapi: {
      method: "POST",
      path: "/user.checkEmailExists",
      summary: "Determines if a given email belongs to an existing user",
      tags: ["Users"],
    },
  })
  .query(async ({ input }) => {
    return withErrorHandling("checkEmailExists", async () => {
      return await userService.doesUserExistByEmail(input.email);
    });
  });

const createUserProfile = protectedProcedure
  .input(createUserProfileInputSchema)
  .output(userDataOutputSchema)
  .meta({
    openapi: {
      method: "POST",
      path: "/user.createUserProfile",
      summary:
        "Create user profile data (name, phone, rank, department, branch, profile picture, LinkedIn). Users can only create their own profile.",
      tags: ["Users"],
    },
  })
  .mutation(async ({ ctx, input }) => {
    return withErrorHandling("createUserProfile", async () => {
      const userId = ctx.auth.user.id;
      return await userService.createUserProfile(userId, input);
    });
  });

const updateUserProfile = protectedProcedure
  .input(updateUserProfileInputSchema)
  .output(userDataOutputSchema)
  .meta({
    openapi: {
      method: "POST",
      path: "/user.updateUserProfile",
      summary:
        "Update user profile data (name, phone, rank, department, branch, profile picture, LinkedIn)",
      tags: ["Users"],
    },
  })
  .mutation(async ({ ctx, input }) => {
    return withErrorHandling("updateUserProfile", async () => {
      const userId = ctx.auth.user.id;
      return await userService.updateUserProfile(userId, input);
    });
  });

const updateUserVisibility = protectedProcedure
  .input(updateUserVisibilityInputSchema)
  .output(userDataOutputSchema)
  .meta({
    openapi: {
      method: "POST",
      path: "/user.updateUserVisibility",
      summary:
        "Update user profile visibility settings (signal/email/linkedin visibility). Users can only update their own settings.",
      tags: ["Users"],
    },
  })
  .mutation(async ({ ctx, input }) => {
    return withErrorHandling("updateUserVisibility", async () => {
      const userId = ctx.auth.user.id;
      return await userService.updateUserVisibility(userId, input);
    });
  });

const getUserRoles = protectedProcedure
  .meta({
    openapi: {
      method: "POST",
      path: "/user.getUserRoles",
      summary:
        "Get all roles for the current user, including implied permissions from role hierarchy",
      tags: ["Users"],
    },
  })
  .output(getUserRolesOutputSchema)
  .query(async ({ ctx }) => {
    return withErrorHandling("getUserRoles", async () => {
      const userId = ctx.auth.user.id;
      const roles = await authRepository.getAllImpliedRolesForUser(userId);
      return Array.from(roles);
    });
  });

const searchUsers = protectedProcedure
  .input(searchUsersInputSchema)
  .meta({
    openapi: {
      method: "POST",
      path: "/user.searchUsers",
      summary: "Search for users with names that include the given name",
      tags: ["Users"],
    },
  })
  .output(searchUsersOutputSchema)
  .query(async ({ input }) => {
    return userService.searchUsers(input.name);
  });

const getUsersByIds = protectedProcedure
  .input(getUsersByIdsInputSchema)
  .meta({
    openapi: {
      method: "POST",
      path: "/user.getUsersByIds",
      summary: "Returns the public-facing data for all given users",
      tags: ["Users"],
    },
  })
  .output(
    z.array(
      userSchema
        .omit({ userId: true })
        .extend(z.object({ id: z.string() }).shape),
    ),
  )
  .query(async ({ input }) => {
    return userService.getUsersByIds(input.user_ids);
  });

const createUser = procedure
  .input(createUserInputSchema)
  .meta({
    openapi: {
      method: "POST",
      path: "/user.createUser",
      summary: "Creates a new user and marks their invite code as used",
      tags: ["Users"],
    },
  })
  .output(createUserOutputSchema)
  .mutation(async (ctx) => {
    return await userService.createUser(ctx.input);
  });

export const userRouter = router({
  getUserData,
  checkEmailExists,
  createUserProfile,
  updateUserProfile,
  updateUserVisibility,
  getUserRoles,
  searchUsers,
  getUsersByIds,
  createUser,
});
