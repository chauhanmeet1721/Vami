import { RedisConnection } from '../database/redis.connection';

export interface StampCacheEntry {
  stamp: string;
  status: string;
}

export class SecurityStampCache {
  /** Architecture §10 — short TTL so suspension/status changes propagate quickly. */
  private static readonly TTL_SECONDS = 30;

  static async set(userId: string, stamp: string, status: string): Promise<void> {
    const client = RedisConnection.getClient();
    const payload = JSON.stringify({ stamp, status } satisfies StampCacheEntry);
    await client.set(`stamp:${userId}`, payload, 'EX', this.TTL_SECONDS);
  }

  static async get(userId: string): Promise<StampCacheEntry | null> {
    const client = RedisConnection.getClient();
    const raw = await client.get(`stamp:${userId}`);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as StampCacheEntry;
      if (typeof parsed.stamp === 'string' && typeof parsed.status === 'string') {
        return parsed;
      }
      return null;
    } catch {
      // Legacy plain-string cache values — treat as miss
      return null;
    }
  }

  static async invalidate(userId: string): Promise<void> {
    const client = RedisConnection.getClient();
    await client.del(`stamp:${userId}`);
  }
}
