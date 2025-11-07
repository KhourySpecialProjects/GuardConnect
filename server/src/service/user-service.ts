import { getRedisClientInstance } from "../data/db/redis.js";
import type { UserRepository } from "../data/repository/user-repo.js";
import { Cache } from "../utils/cache.js";
import log from "../utils/logger.js";

export class UserService {
  private usersRepo: UserRepository;

  /**
   * @param usersRepo (optional) a reportRepository instance
   */
  constructor(usersRepo: UserRepository) {
    this.usersRepo = usersRepo;
  }

  @Cache((user_id: string) => `user:${user_id}:data`)
  async getUserData(user_id: string) {
    return this.usersRepo.getUserData(user_id);
  }

  async doesUserExistByEmail(email: string) {
    return this.usersRepo.doesUserExistByEmail(email);
  }

  async updateUserProfile(
    userId: string,
    updateData: {
      name?: string;
      phoneNumber?: string | null;
      rank?: string | null;
      department?: string | null;
      branch?: string | null;
      image?: string | null;
    },
  ) {
    const updated = await this.usersRepo.updateUserProfile(userId, updateData);

    // Invalidate cache for this user (best effort - don't fail if Redis is unavailable)
    const cacheKey = `user:${userId}:data`;
    try {
      await getRedisClientInstance().DEL(cacheKey);
    } catch (error) {
      // Log but don't fail the operation if cache invalidation fails
      log.warn(
        { error, cacheKey, userId },
        "Failed to invalidate user cache after profile update",
      );
    }

    return updated;
  }
}
