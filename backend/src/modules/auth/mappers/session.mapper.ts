import { ISession } from '../models/session.model';

/** Client-safe session projection — never includes refreshTokenHash. */
export interface PublicSession {
  _id: string;
  userId: string;
  familyId: string;
  deviceInfo: ISession['deviceInfo'];
  ipAddress: string;
  userAgent: string;
  lastActiveAt: Date;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export function toPublicSession(session: ISession): PublicSession {
  return {
    _id: String(session._id),
    userId: String(session.userId),
    familyId: session.familyId,
    deviceInfo: session.deviceInfo,
    ipAddress: session.ipAddress,
    userAgent: session.userAgent,
    lastActiveAt: session.lastActiveAt,
    expiresAt: session.expiresAt,
    isRevoked: session.isRevoked,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}
