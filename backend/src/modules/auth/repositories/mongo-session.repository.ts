import { SessionModel, ISession } from '../models/session.model';
import { ISessionRepository } from './session.repository.interface';
import { Types } from 'mongoose';

export class MongoSessionRepository implements ISessionRepository {
  async create(session: Partial<ISession> & { _id?: Types.ObjectId }): Promise<ISession> {
    // If _id is pre-generated (single-write pattern), pass it to the model directly
    const newSession = new SessionModel(session);
    const saved = await newSession.save();
    return saved.toObject() as ISession;
  }

  async findById(id: string): Promise<ISession | null> {
    const session = await SessionModel.findById(id).lean<ISession>().exec();
    return session;
  }

  async findByRefreshTokenHash(hash: string): Promise<ISession | null> {
    const session = await SessionModel.findOne({ refreshTokenHash: hash })
      .lean<ISession>()
      .exec();
    return session;
  }

  async findByFamilyId(familyId: string): Promise<ISession[]> {
    const sessions = await SessionModel.find({ familyId })
      .lean<ISession[]>()
      .exec();
    return sessions;
  }

  async findActiveByUserId(userId: string): Promise<ISession[]> {
    const sessions = await SessionModel.find({
      userId,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    })
      .sort({ lastActiveAt: -1 })
      .lean<ISession[]>()
      .exec();
    return sessions;
  }

  async update(id: string, update: Partial<ISession>): Promise<ISession | null> {
    const updated = await SessionModel.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    )
      .lean<ISession>()
      .exec();
    return updated;
  }

  async revokeFamily(familyId: string): Promise<void> {
    await SessionModel.updateMany(
      { familyId },
      { $set: { isRevoked: true, revokedAt: new Date() } }
    ).exec();
  }

  async revokeUserOtherSessions(
    userId: string,
    currentSessionId: string
  ): Promise<void> {
    await SessionModel.updateMany(
      {
        userId,
        _id: { $ne: currentSessionId },
        isRevoked: false,
      },
      { $set: { isRevoked: true, revokedAt: new Date() } }
    ).exec();
  }

  async revokeAllSessions(userId: string): Promise<void> {
    await SessionModel.updateMany(
      { userId, isRevoked: false },
      { $set: { isRevoked: true, revokedAt: new Date() } }
    ).exec();
  }

  async revokeSession(id: string): Promise<boolean> {
    const res = await SessionModel.findByIdAndUpdate(id, {
      $set: { isRevoked: true, revokedAt: new Date() },
    }).exec();
    return !!res;
  }
}
