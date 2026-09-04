import { Schema, model, Document, Types } from 'mongoose';

export interface IEmailVerification {
  _id?: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  tokenHash: string; // SHA-256 hash of the plain token
  expiresAt: Date;
  usedAt?: Date;
  createdAt?: Date;
}

export type IEmailVerificationDocument = IEmailVerification & Document;

const emailVerificationSchema = new Schema<IEmailVerificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      // TTL index: automatically deletes document when current time > expiresAt
      // Useful to clean up unused tokens.
      index: { expires: 0 },
    },
    usedAt: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

export const EmailVerificationModel = model<IEmailVerificationDocument>(
  'EmailVerification',
  emailVerificationSchema
);
