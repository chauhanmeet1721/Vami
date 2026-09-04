import { IPasswordReset, PasswordResetModel } from '../models/password-reset.model';

export interface IPasswordResetRepository {
  create(data: Partial<IPasswordReset>): Promise<IPasswordReset>;
  findByTokenHash(hash: string): Promise<IPasswordReset | null>;
  markAsUsed(id: string): Promise<void>;
  revokePendingForUser(userId: string): Promise<void>;
}

export class MongoPasswordResetRepository implements IPasswordResetRepository {
  async create(data: Partial<IPasswordReset>): Promise<IPasswordReset> {
    const doc = new PasswordResetModel(data);
    const saved = await doc.save();
    return saved.toObject();
  }

  async findByTokenHash(hash: string): Promise<IPasswordReset | null> {
    return PasswordResetModel.findOne({ tokenHash: hash, usedAt: { $exists: false } }).lean().exec();
  }

  async markAsUsed(id: string): Promise<void> {
    await PasswordResetModel.findByIdAndUpdate(id, { $set: { usedAt: new Date() } }).exec();
  }

  async revokePendingForUser(userId: string): Promise<void> {
    await PasswordResetModel.deleteMany({ userId, usedAt: { $exists: false } }).exec();
  }
}
