import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors/app-error';

/**
 * requireRole — authorization middleware (runs after `authenticate`).
 *
 * Ensures the authenticated user has one of the specified roles.
 * If the role check fails, returns 403 Forbidden — NOT 401.
 * 401 means "not authenticated". 403 means "authenticated but not authorized".
 *
 * Usage:
 *   router.get('/admin/users', authenticate, requireRole('admin'), controller.getAll);
 */
export const requireRole = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ForbiddenError('Access denied'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError(`This action requires one of the following roles: ${roles.join(', ')}`)
      );
    }

    next();
  };
};
