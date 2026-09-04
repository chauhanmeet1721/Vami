import { UserModel, IUser } from '../models/user.model';
import { IUserRepository } from './user.repository.interface';

export class MongoUserRepository implements IUserRepository {
  async findById(id: string): Promise<IUser | null> {
    const user = await UserModel.findById(id).lean<IUser>().exec();
    return user;
  }

  async findOne(filter: Record<string, unknown>): Promise<IUser | null> {
    const user = await UserModel.findOne(filter).lean<IUser>().exec();
    return user;
  }

  async find(filter: Record<string, unknown> = {}): Promise<IUser[]> {
    const users = await UserModel.find(filter).lean<IUser[]>().exec();
    return users;
  }

  async findPaginated(
    filter: Record<string, unknown>,
    skip: number,
    limit: number
  ): Promise<{ items: IUser[]; total: number }> {
    const [items, total] = await Promise.all([
      UserModel.find(filter).skip(skip).limit(limit).lean<IUser[]>().exec(),
      UserModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  async create(item: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(item);
    const saved = await user.save();
    return saved.toObject() as IUser;
  }

  async update(id: string, item: Partial<IUser>): Promise<IUser | null> {
    const updated = await UserModel.findByIdAndUpdate(id, { $set: item }, { new: true })
      .lean<IUser>()
      .exec();
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async findByEmail(email: string, includePassword = false): Promise<IUser | null> {
    const query = UserModel.findOne({ email });
    if (includePassword) {
      query.select('+password');
    }
    const user = await query.lean<IUser>().exec();
    return user;
  }
}
