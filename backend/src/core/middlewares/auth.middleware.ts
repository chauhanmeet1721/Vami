import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/app-error';
import { JwtUtil } from '../utils/jwt.util';
import { TokenBlocklistService } from '../services/token-blocklist.service';
import { SecurityStampCache } from '../services/security-stamp.cache';
import { UserModel } from '../../modules/users/models/user.model';

/**
 * authenticate — Express middleware that verifies the access token.
 *
 * Security chain (current):
 *   1. Extract Bearer token from Authorization header
 *   2. Verify JWT signature + expiry (jose throws JWTExpired / JWSInvalid on failure)
 *   3. Attach decoded payload to req.user and req.sessionId
 *
 * Security chain (Phase 2 additions — see task.md 2.8-2.10):
 *   4. Check Redis blocklist for jti (logout detection)
 *   5. Validate securityStamp against Redis cache (password change / suspension detection)
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

  // jose.jwtVerify is async — must use promise chain in Express 5 middleware
  JwtUtil.verifyAccessToken(token)
    .then(async (decoded) => {
      // Phase 2: Check Redis blocklist (logout detection)
      const isBlocked = await TokenBlocklistService.isTokenBlocked(decoded.jti);
      if (isBlocked) {
        return next(new UnauthorizedError('Token has been revoked'));
      }

      // Phase 2: Validate securityStamp against Redis cache
      let currentStamp = await SecurityStampCache.get(decoded.userId);
      
      // Cache miss: fetch from DB and populate cache
      if (!currentStamp) {
        const user = await UserModel.findById(decoded.userId).select('securityStamp status').lean().exec();
        if (!user || user.status === 'suspended') {
          return next(new UnauthorizedError('User account not found or suspended'));
        }
        currentStamp = user.securityStamp;
        await SecurityStampCache.set(decoded.userId, currentStamp);
      }

      // Validate stamp
      if (currentStamp !== decoded.securityStamp) {
        return next(new UnauthorizedError('Session expired due to security changes (password changed or account suspended)'));
      }

      req.user = decoded;
      req.sessionId = decoded.sessionId;
      next();
    })
    .catch((error) => {
      next(new UnauthorizedError('Invalid or expired authentication token', error));
    });
};
