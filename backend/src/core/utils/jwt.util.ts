import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import crypto from 'crypto';
import { envConfig } from '../config/env.config';

// Encode secrets as Uint8Array (required by jose Web Crypto API)
const accessSecret = new TextEncoder().encode(envConfig.JWT_ACCESS_SECRET);
const refreshSecret = new TextEncoder().encode(envConfig.JWT_REFRESH_SECRET);

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
  securityStamp: string;
  jti: string; // JWT ID — used for Redis blocklist on logout
}

export interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
  familyId: string;
}

export class JwtUtil {
  /**
   * Hashes a token using SHA-256 for secure database storage
   */
  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Parses a duration string like "7d", "30d", "1h", "15m" into seconds.
   * jose's setExpirationTime accepts seconds as a number.
   */
  static parseDurationSeconds(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60; // fallback: 7 days
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 60 * 60,
      d: 24 * 60 * 60,
    };
    return value * multipliers[unit];
  }

  /**
   * Generates a short-lived access token (default 15 minutes).
   * Includes jti (JWT ID) for Redis blocklist support.
   */
  static async generateAccessToken(payload: Omit<AccessTokenPayload, 'jti'>): Promise<string> {
    const jti = crypto.randomUUID();
    const expiresInSec = this.parseDurationSeconds(envConfig.JWT_ACCESS_EXPIRES_IN);

    return new SignJWT({
      ...payload,
      jti,
    } as JWTPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + expiresInSec)
      .sign(accessSecret);
  }

  /**
   * Generates a signed long-lived refresh token.
   * expiresAt is derived from JWT_REFRESH_EXPIRES_IN so session TTL always matches.
   */
  static async generateRefreshToken(payload: RefreshTokenPayload): Promise<{
    token: string;
    hash: string;
    expiresAt: Date;
  }> {
    const expiresInSec = this.parseDurationSeconds(envConfig.JWT_REFRESH_EXPIRES_IN);
    const expiresAt = new Date(Date.now() + expiresInSec * 1000);

    const token = await new SignJWT(payload as unknown as JWTPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + expiresInSec)
      .sign(refreshSecret);

    const hash = this.hashToken(token);
    return { token, hash, expiresAt };
  }

  /**
   * Verifies and decodes an access token.
   * Throws JWTExpired or JWSInvalid if token is invalid.
   */
  static async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    const { payload } = await jwtVerify(token, accessSecret, {
      algorithms: ['HS256'],
    });
    return payload as unknown as AccessTokenPayload;
  }

  /**
   * Verifies and decodes a refresh token.
   * Throws JWTExpired or JWSInvalid if token is invalid.
   */
  static async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    const { payload } = await jwtVerify(token, refreshSecret, {
      algorithms: ['HS256'],
    });
    return payload as unknown as RefreshTokenPayload;
  }
}
