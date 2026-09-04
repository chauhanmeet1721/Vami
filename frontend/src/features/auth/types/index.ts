export interface IAppAccess {
  appId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  username?: string;
  email: string;
  role: 'user' | 'admin';
  avatarUrl?: string | null;
  isEmailVerified: boolean;
  status: 'active' | 'suspended' | 'pending';
  apps: IAppAccess[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IDeviceInfo {
  browser: string;
  os: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
}

export interface ISession {
  _id: string;
  userId: string;
  familyId: string;
  deviceInfo: IDeviceInfo;
  ipAddress: string;
  userAgent: string;
  lastActiveAt: string;
  expiresAt: string;
  isRevoked: boolean;
  createdAt?: string;
}

export interface AuthResponseData {
  user: UserProfile;
  accessToken: string;
  session?: ISession;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  username?: string;
}
