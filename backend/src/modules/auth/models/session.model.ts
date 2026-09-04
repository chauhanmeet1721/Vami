import { Schema, model, Document, Types } from 'mongoose';

export interface IDeviceInfo {
  browser: string;
  os: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
}

export interface ISession {
  _id?: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  refreshTokenHash: string;
  familyId: string;
  deviceInfo: IDeviceInfo;
  ipAddress: string;
  userAgent: string;
  lastActiveAt: Date;
  expiresAt: Date;
  isRevoked: boolean;
  revokedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ISessionDocument = ISession & Document;

const sessionSchema = new Schema<ISessionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    refreshTokenHash: {
      type: String,
      required: true,
      index: true,
    },
    familyId: {
      type: String,
      required: true,
      index: true,
    },
    deviceInfo: {
      browser: { type: String, default: 'Unknown' },
      os: { type: String, default: 'Unknown' },
      deviceType: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet', 'unknown'],
        default: 'unknown',
      },
    },
    ipAddress: {
      type: String,
      default: 'Unknown',
    },
    userAgent: {
      type: String,
      default: 'Unknown',
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    revokedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// TTL index: MongoDB auto-deletes documents where expiresAt < now
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Composite index for the most frequent query: findActiveByUserId
// Covers: SessionModel.find({ userId, isRevoked: false, expiresAt: { $gt: now } })
// Without this, MongoDB cannot use a single index and falls back to a collection scan.
sessionSchema.index({ userId: 1, isRevoked: 1, expiresAt: 1 });

export const SessionModel = model<ISessionDocument>('Session', sessionSchema);
