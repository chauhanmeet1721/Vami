import { IEmailVerification, EmailVerificationModel } from '../models/email-verification.model';

export interface IEmailVerificationRepository {
  create(data: Partial<IEmailVerification>): Promise<IEmailVerification>;
  findByTokenHash(hash: string): Promise<IEmailVerification | null>;
  markAsUsed(id: string): Promise<void>;
  revokePendingForUser(userId: string): Promise<void>;
}

export class MongoEmailVerificationRepository implements IEmailVerificationRepository {
  async create(data: Partial<IEmailVerification>): Promise<IEmailVerification> {
    const doc = new EmailVerificationModel(data);
    const saved = await doc.save();
    return saved.toObject();
  }

  async findByTokenHash(hash: string): Promise<IEmailVerification | null> {
    return EmailVerificationModel.findOne({ tokenHash: hash, usedAt: { $exists: false } }).lean().exec();
  }

  async markAsUsed(id: string): Promise<void> {
    await EmailVerificationModel.findByIdAndUpdate(id, { $set: { usedAt: new Date() } }).exec();
  }

  async revokePendingForUser(userId: string): Promise<void> {
    // We mark them as used (or could just delete them) so they can't be used again
    await EmailVerificationModel.deleteMany({ userId, usedAt: { $exists: false } }).exec();
  }
}
