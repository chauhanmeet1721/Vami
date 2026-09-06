/**
 * Client types mirrored from backend models/mappers.
 * Sources:
 * - backend/src/modules/users/models/user.model.ts (IUser, password omitted)
 * - backend/src/modules/auth/mappers/session.mapper.ts (PublicSession)
 * - backend/src/modules/auth/controllers/auth.controller.ts (response data shapes)
 */

export type UserRole = "user" | "admin";
export type UserStatus = "active" | "suspended" | "pending";

export type AppAccess = {
  appId: string;
  role: "owner" | "admin" | "member";
  joinedAt: string;
};

/** User as returned by auth endpoints (password never included). */
export type AuthUser = {
  _id: string;
  name: string;
  username?: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
  isEmailVerified: boolean;
  status: UserStatus;
  apps: AppAccess[];
  securityStamp: string;
  createdAt?: string;
  updatedAt?: string;
};

export type DeviceInfo = {
  browser?: string;
  os?: string;
  deviceType?: string;
};

export type PublicSession = {
  _id: string;
  userId: string;
  familyId: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  userAgent: string;
  lastActiveAt: string;
  expiresAt: string;
  isRevoked: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthSuccessData = {
  user: AuthUser;
  accessToken: string;
  session: PublicSession;
};

export type RegisterVerificationPendingData = {
  user: AuthUser;
  requiresEmailVerification: true;
};

export type RegisterResult = AuthSuccessData | RegisterVerificationPendingData;

export type MeData = {
  user: AuthUser;
  activeSessionId: string;
};

export function isAuthSuccess(
  data: RegisterResult,
): data is AuthSuccessData {
  return "accessToken" in data && typeof data.accessToken === "string";
}
