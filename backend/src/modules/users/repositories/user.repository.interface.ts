import { IBaseRepository } from '../../../core/repository/base.repository.interface';
import { IUser } from '../models/user.model';

export interface IUserRepository extends IBaseRepository<IUser> {
  findByEmail(email: string, includePassword?: boolean): Promise<IUser | null>;
  findPaginated(
    filter: Record<string, unknown>,
    skip: number,
    limit: number
  ): Promise<{ items: IUser[]; total: number }>;
}
