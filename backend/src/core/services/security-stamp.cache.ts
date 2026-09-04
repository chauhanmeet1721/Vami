import { RedisConnection } from '../database/redis.connection';
import { JwtUtil } from '../utils/jwt.util';
import { envConfig } from '../config/env.config';

export class SecurityStampCache {
  /**
   * TTL matches the access token lifetime.
   * The stamp only needs to be cached for as long as a token issued with it can still be used.
   * Invalidation on password change/suspension is handled by SecurityStampCache.invalidate().
   */
  private static readonly TTL_SECONDS = JwtUtil.parseDurationSeconds(envConfig.JWT_ACCESS_EXPIRES_IN);

  /**
   * Caches a user's security stamp for quick validation in middleware.
   */
  static async set(userId: string, stamp: string): Promise<void> {
    const client = RedisConnection.getClient();
    await client.set(`stamp:${userId}`, stamp, 'EX', this.TTL_SECONDS);
  }

  /**
   * Retrieves a user's security stamp from cache.
   */
  static async get(userId: string): Promise<string | null> {
    const client = RedisConnection.getClient();
    return await client.get(`stamp:${userId}`);
  }

  /**
   * Invalidates a user's security stamp cache.
   * Should be called whenever a password changes or account is suspended.
   */
  static async invalidate(userId: string): Promise<void> {
    const client = RedisConnection.getClient();
    await client.del(`stamp:${userId}`);
  }
}
