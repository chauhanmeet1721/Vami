import { RedisConnection } from '../database/redis.connection';
import { JwtUtil } from '../utils/jwt.util';
import { envConfig } from '../config/env.config';

export class TokenBlocklistService {
  /**
   * Blocks a specific JWT ID (jti).
   * TTL is derived from the JWT_ACCESS_EXPIRES_IN environment variable,
   * so the key auto-expires exactly when the original token would have expired anyway.
   */
  static async blockToken(jti: string): Promise<void> {
    const client = RedisConnection.getClient();
    const expiresInSec = JwtUtil.parseDurationSeconds(envConfig.JWT_ACCESS_EXPIRES_IN);

    await client.set(`blocklist:jti:${jti}`, '1', 'EX', expiresInSec);
  }

  /**
   * Checks if a token ID (jti) is in the blocklist.
   * Returns true if blocked (invalid), false if not blocked (valid).
   */
  static async isTokenBlocked(jti: string): Promise<boolean> {
    const client = RedisConnection.getClient();
    const result = await client.get(`blocklist:jti:${jti}`);
    return result === '1';
  }
}
