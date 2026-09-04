import { IUserRepository } from '../repositories/user.repository.interface';
import { IUser } from '../models/user.model';
import { NotFoundError, ConflictError } from '../../../core/errors/app-error';
import { UpdateUserDto } from '../dtos/user.dto';

export class UserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async getUserById(id: string): Promise<Omit<IUser, 'password'>> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }
    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  async getAllUsers(): Promise<Omit<IUser, 'password'>[]> {
    const users = await this.userRepository.find();
    return users.map(({ password: _, ...user }) => user);
  }

  async updateUser(
    id: string,
    updateData: UpdateUserDto
  ): Promise<Omit<IUser, 'password'>> {
    if (updateData.email) {
      const existing = await this.userRepository.findByEmail(updateData.email);
      if (existing && String(existing._id) !== id) {
        throw new ConflictError('Email is already in use by another user');
      }
    }

    const updated = await this.userRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    const { password: _, ...safeUser } = updated;
    return safeUser;
  }

  async deleteUser(id: string): Promise<void> {
    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }
  }
}
