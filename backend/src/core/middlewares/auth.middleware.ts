import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../errors/app-error';
import { JwtUtil } from '../utils/jwt.util';
import { TokenBlocklistService } from '../services/token-blocklist.service';
import { SecurityStampCache } from '../services/security-stamp.cache';
import { UserModel } from '../../modules/users/models/user.model';
import { envConfig } from '../config/env.config';

/**
 * authenticate — Express middleware that verifies the access token.
 *
 * Security chain:
 *   1. Extract Bearer token
 *   2. Verify JWT (jose)
 *   3. Redis jti blocklist
 *   4. securityStamp + status via Redis cache (TTL 30s) or DB on miss
 */
export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Authentication token missing or invalid'));
  }

  const token = authHeader.split(' ')[1];

  JwtUtil.verifyAccessToken(token)
    .then(async (decoded) => {
      const isBlocked = await TokenBlocklistService.isTokenBlocked(decoded.jti);
      if (isBlocked) {
        return next(new UnauthorizedError('Token has been revoked'));
      }

      let cached = await SecurityStampCache.get(decoded.userId);

      if (!cached) {
        const user = await UserModel.findById(decoded.userId)
          .select('securityStamp status isEmailVerified')
          .lean()
          .exec();
        if (!user) {
          return next(new UnauthorizedError('User account not found or suspended'));
        }
        cached = { stamp: user.securityStamp, status: user.status };
        await SecurityStampCache.set(decoded.userId, user.securityStamp, user.status);
      }

      if (cached.status === 'suspended') {
        return next(new UnauthorizedError('User account not found or suspended'));
      }

      if (
        envConfig.REQUIRE_EMAIL_VERIFICATION &&
        cached.status === 'pending'
      ) {
        return next(
          new ForbiddenError('Please verify your email address before continuing.')
        );
      }

      if (cached.stamp !== decoded.securityStamp) {
        return next(
          new UnauthorizedError(
            'Session expired due to security changes (password changed or account suspended)'
          )
        );
      }

      req.user = decoded;
      req.sessionId = decoded.sessionId;
      next();
    })
    .catch(() => {
      next(new UnauthorizedError('Invalid or expired authentication token'));
    });
};
