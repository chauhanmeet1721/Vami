import { Schema, model, Document, Types } from 'mongoose';

export interface IPasswordReset {
  _id?: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  tokenHash: string; // SHA-256 hash of the plain token
  expiresAt: Date;
  usedAt?: Date;
  createdAt?: Date;
}

export type IPasswordResetDocument = IPasswordReset & Document;

const passwordResetSchema = new Schema<IPasswordResetDocument>(
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
      index: { expires: 0 }, // TTL index
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

export const PasswordResetModel = model<IPasswordResetDocument>(
  'PasswordReset',
  passwordResetSchema
);
