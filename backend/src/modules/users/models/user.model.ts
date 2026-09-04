import crypto from 'crypto';
import { Schema, model, Document, Types } from 'mongoose';


export interface IAppAccess {
  appId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

export interface IUser {
  _id?: Types.ObjectId | string;
  name: string;
  username?: string;     // unique handle for @mentions and DMs (auto-generated if not provided)
  email: string;
  password?: string;     // select:false — optional for OAuth users
  role: 'user' | 'admin';
  avatarUrl?: string;
  isEmailVerified: boolean;
  status: 'active' | 'suspended' | 'pending';
  apps: IAppAccess[];
  securityStamp: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IUserDocument = IUser & Document;

const appAccessSchema = new Schema<IAppAccess>(
  {
    appId: { type: String, required: true },
    role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      // Not required — OAuth users (Google, GitHub SSO) will have no password.
      // Password-based registration validates this at the DTO level.
      required: false,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    username: {
      type: String,
      // sparse: true — unique constraint only applies to documents where username is set
      // This allows null/undefined for users who haven't set a username yet
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 20,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'pending'],
      default: 'active',
      index: true,
    },
    apps: {
      type: [appAccessSchema],
      // Factory function ensures each document gets its OWN timestamp,
      // not the module-load timestamp that would be shared across all users.
      default: () => [{ appId: 'chat', role: 'member', joinedAt: new Date() }],
    },
    securityStamp: {
      type: String,
      required: true,
      // crypto.randomUUID() is CSPRNG-backed (cryptographically secure).
      // Math.random() is NOT cryptographically secure — never use it for secrets.
      default: () => crypto.randomUUID(),
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const UserModel = model<IUserDocument>('User', userSchema);
