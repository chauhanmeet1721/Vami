import { ISession } from '../models/session.model';
import { Types } from 'mongoose';

export interface ISessionRepository {
  /**
   * Creates a new session. If `session._id` is provided (pre-generated ObjectId),
   * it will be used directly — enabling the single-write pattern in AuthService.
   */
  create(session: Partial<ISession> & { _id?: Types.ObjectId }): Promise<ISession>;
  findById(id: string): Promise<ISession | null>;
  findByRefreshTokenHash(hash: string): Promise<ISession | null>;
  findByFamilyId(familyId: string): Promise<ISession[]>;
  findActiveByUserId(userId: string): Promise<ISession[]>;
  update(id: string, update: Partial<ISession>): Promise<ISession | null>;
  revokeFamily(familyId: string): Promise<void>;
  revokeUserOtherSessions(userId: string, currentSessionId: string): Promise<void>;
  /** Revokes every active session for a user — used after password reset. */
  revokeAllSessions(userId: string): Promise<void>;
  revokeSession(id: string): Promise<boolean>;
}
