import { IUserRepository } from '../repositories/user.repository.interface';
import { ISessionRepository } from '../../auth/repositories/session.repository.interface';
import { IUser } from '../models/user.model';
import { NotFoundError, ConflictError } from '../../../core/errors/app-error';
import { UpdateUserDto } from '../dtos/user.dto';
import { SecurityStampCache } from '../../../core/services/security-stamp.cache';
import crypto from 'crypto';

const DEFAULT_PAGE_LIMIT = 50;
const MAX_PAGE_LIMIT = 100;

export class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly sessionRepository: ISessionRepository
  ) {}

  async getUserById(id: string): Promise<Omit<IUser, 'password'>> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }
    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  async getAllUsers(
    page = 1,
    limit = DEFAULT_PAGE_LIMIT
  ): Promise<{ users: Omit<IUser, 'password'>[]; page: number; limit: number; total: number }> {
    const safeLimit = Math.min(Math.max(limit, 1), MAX_PAGE_LIMIT);
    const safePage = Math.max(page, 1);
    const skip = (safePage - 1) * safeLimit;

    const { items, total } = await this.userRepository.findPaginated({}, skip, safeLimit);
    return {
      users: items.map(({ password: _, ...user }) => user),
      page: safePage,
      limit: safeLimit,
      total,
    };
  }

  async updateUser(
    id: string,
    updateData: UpdateUserDto
  ): Promise<Omit<IUser, 'password'>> {
    const patch: UpdateUserDto & Partial<IUser> = { ...updateData };

    if (updateData.email) {
      const existing = await this.userRepository.findByEmail(updateData.email);
      if (existing && String(existing._id) !== id) {
        throw new ConflictError('Email is already in use by another user');
      }
      // Email change requires re-verification
      patch.isEmailVerified = false;
      patch.status = 'pending';
      patch.securityStamp = crypto.randomUUID();
    }

    const updated = await this.userRepository.update(id, patch);
    if (!updated) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    if (updateData.email) {
      await SecurityStampCache.invalidate(id);
      await this.sessionRepository.revokeAllSessions(id);
    }

    const { password: _, ...safeUser } = updated;
    return safeUser;
  }

  async deleteUser(id: string): Promise<void> {
    await this.sessionRepository.revokeAllSessions(id);
    await SecurityStampCache.invalidate(id);

    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }
  }
}
