import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { ApiResponse } from '../../../core/utils/response.util';
import { ForbiddenError } from '../../../core/errors/app-error';

export class UserController {
  constructor(private readonly userService: UserService) {}

  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.getUserById(req.params.id as string);
      ApiResponse.success(res, user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getAllUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      ApiResponse.success(res, users, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /users/:id — GAP-17 fix.
   * A user may only update their own profile.
   * An admin may update any profile.
   */
  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isOwner = req.user!.userId === req.params.id;
      const isAdmin = req.user!.role === 'admin';

      if (!isOwner && !isAdmin) {
        return next(new ForbiddenError('You can only update your own profile'));
      }

      const user = await this.userService.updateUser(req.params.id as string, req.body);
      ApiResponse.success(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /users/:id — GAP-17 fix.
   * A user may only delete their own account.
   * An admin may delete any account.
   */
  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isOwner = req.user!.userId === req.params.id;
      const isAdmin = req.user!.role === 'admin';

      if (!isOwner && !isAdmin) {
        return next(new ForbiddenError('You can only delete your own account'));
      }

      await this.userService.deleteUser(req.params.id as string);
      ApiResponse.success(res, null, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
