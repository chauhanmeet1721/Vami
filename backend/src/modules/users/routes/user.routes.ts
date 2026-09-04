import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../../../core/middlewares/auth.middleware';
import { requireRole } from '../../../core/middlewares/require-role.middleware';
import { validate } from '../../../core/middlewares/validate.middleware';
import { updateUserSchema } from '../dtos/user.dto';

export const createUserRouter = (userController: UserController): Router => {
  const router = Router();

  // All user routes require authentication
  router.use(authenticate);

  /**
   * GET /users — admin only.
   * Any authenticated non-admin user enumerating all users is a data exposure risk.
   * This endpoint is reserved for admin tooling.
   */
  router.get('/', requireRole('admin'), userController.getAllUsers);

  /**
   * GET /users/:id — any authenticated user can view a profile by ID.
   * Ownership not required for read — profiles are not secret.
   */
  router.get('/:id', userController.getUserById);

  /**
   * PATCH /users/:id — user can only update their own profile; admins can update anyone.
   * Ownership enforcement is in the controller.
   */
  router.patch('/:id', validate(updateUserSchema), userController.updateUser);

  /**
   * DELETE /users/:id — user can only delete their own account; admins can delete anyone.
   * Ownership enforcement is in the controller.
   */
  router.delete('/:id', userController.deleteUser);

  return router;
};
