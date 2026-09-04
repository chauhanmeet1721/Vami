import crypto from 'crypto';
import { Types } from 'mongoose';
import { IUserRepository } from '../../users/repositories/user.repository.interface';
import { ISessionRepository } from '../repositories/session.repository.interface';
import { IEmailVerificationRepository } from '../repositories/email-verification.repository';
import { IPasswordResetRepository } from '../repositories/password-reset.repository';
import { RegisterDto, LoginDto } from '../dtos/auth.dto';
import { Argon2Util } from '../../../core/utils/argon2.util';
import { JwtUtil } from '../../../core/utils/jwt.util';
import { DeviceParserUtil } from '../../../core/utils/device-parser.util';
import { logger } from '../../../core/utils/logger';
import { TokenBlocklistService } from '../../../core/services/token-blocklist.service';
import { SecurityStampCache } from '../../../core/services/security-stamp.cache';
import { emailService } from '../../../core/services/email.service';
import { envConfig } from '../../../core/config/env.config';
import {
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  BadRequestError,
} from '../../../core/errors/app-error';
import { IUser } from '../../users/models/user.model';
import { PublicSession, toPublicSession } from '../mappers/session.mapper';

export interface ClientContext {
  userAgent: string;
  ipAddress: string;
}

export interface AuthSessionResult {
  user: Omit<IUser, 'password'>;
  accessToken?: string;
  refreshToken?: string;
  session?: PublicSession;
  requiresEmailVerification?: boolean;
}

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour — architecture §13

export interface RefreshResult {
  accessToken: string;
  newRefreshToken: string;
}

export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly sessionRepository: ISessionRepository,
    private readonly emailVerificationRepository: IEmailVerificationRepository,
    private readonly passwordResetRepository: IPasswordResetRepository
  ) {}

  async register(
    data: RegisterDto,
    context: ClientContext
  ): Promise<AuthSessionResult> {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('A user with this email address already exists');
    }

    const hashedPassword = await Argon2Util.hash(data.password);

    // Auto-generate username from email prefix + random suffix if not provided
    const baseUsername = (data.username ?? data.email.split('@')[0])
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .substring(0, 15);
    const username = `${baseUsername}_${crypto.randomBytes(2).toString('hex')}`;

    const newUser = await this.userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      username,
      role: 'user',
      isEmailVerified: false,
      // GAP-1: status starts as 'pending'. Enforcement gated by REQUIRE_EMAIL_VERIFICATION.
      status: envConfig.REQUIRE_EMAIL_VERIFICATION ? 'pending' : 'active',
      apps: [{ appId: 'chat', role: 'member', joinedAt: new Date() }],
      securityStamp: crypto.randomUUID(),
    });

    if (envConfig.REQUIRE_EMAIL_VERIFICATION) {
      // Generate secure 32-byte token and send it via email (or return for dev)
      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await this.emailVerificationRepository.create({
        userId: newUser._id,
        tokenHash,
        expiresAt,
      });

      // Dev: log the token so it can be used without an actual email
      if (envConfig.isDevelopment) {
        logger.info({ email: newUser.email, token }, '[Dev] Verification token generated');
      }

      // Send real email (no-op if RESEND_API_KEY not configured)
      const appUrl = envConfig.APP_URL;
      await emailService.sendVerificationEmail({
        to: newUser.email,
        name: newUser.name,
        token,
        appUrl,
      });

      const { password: _, ...safeUser } = newUser;
      return {
        user: safeUser,
        requiresEmailVerification: true,
      };
    }

    return this.createSessionAndTokens(newUser, context);
  }

  async login(
    data: LoginDto,
    context: ClientContext
  ): Promise<AuthSessionResult> {
    const user = await this.userRepository.findByEmail(data.email, true);
    if (!user || !user.password) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status === 'suspended') {
      throw new ForbiddenError('Your account has been suspended. Please contact support.');
    }

    if (
      envConfig.REQUIRE_EMAIL_VERIFICATION &&
      (user.status === 'pending' || !user.isEmailVerified)
    ) {
      throw new ForbiddenError(
        'Please verify your email address before signing in. Check your inbox for a verification link.'
      );
    }

    const isValidPassword = await Argon2Util.verify(user.password, data.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    return this.createSessionAndTokens(user, context);
  }

  /**
   * Refresh Token Rotation (RTR) with Automatic Reuse Detection.
   *
   * RTR security chain:
   * 1. Verify JWT signature (jose — throws on invalid/expired)
   * 2. Hash the raw token and look up the session
   * 3. If session not found or already revoked → REUSE DETECTED → revoke entire family
   * 4. Issue new refresh token (rotation) + new access token
   */
  async refresh(
    rawRefreshToken: string,
    context: ClientContext
  ): Promise<RefreshResult> {
    let decoded;
    try {
      decoded = await JwtUtil.verifyRefreshToken(rawRefreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const tokenHash = JwtUtil.hashToken(rawRefreshToken);
    const session = await this.sessionRepository.findByRefreshTokenHash(tokenHash);

    // Session document missing (TTL expiry / never existed) — expired, not reuse.
    if (!session) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // REUSE DETECTION: presented refresh matches a revoked session (rotated/stolen).
    if (session.isRevoked) {
      logger.warn(
        { familyId: decoded.familyId, userId: decoded.userId },
        '[Security] Refresh token reuse detected — revoking entire session family'
      );
      await this.sessionRepository.revokeFamily(decoded.familyId);
      throw new UnauthorizedError(
        'Compromised session detected. All devices in this session chain have been logged out for security.'
      );
    }

    // Verify user identity and account status
    const user = await this.userRepository.findById(String(session.userId));
    if (!user || user.status === 'suspended') {
      await this.sessionRepository.revokeSession(String(session._id));
      throw new UnauthorizedError('User account not found or suspended');
    }

    if (
      envConfig.REQUIRE_EMAIL_VERIFICATION &&
      (user.status === 'pending' || !user.isEmailVerified)
    ) {
      await this.sessionRepository.revokeSession(String(session._id));
      throw new ForbiddenError('Please verify your email address before continuing.');
    }

    // Generate new refresh token in the same family (Rotation)
    const newRefresh = await JwtUtil.generateRefreshToken({
      userId: String(user._id),
      sessionId: String(session._id),
      familyId: session.familyId,
    });

    // Update session with rotated token hash and refreshed device context
    const deviceInfo = DeviceParserUtil.parse(context.userAgent);
    await this.sessionRepository.update(String(session._id), {
      refreshTokenHash: newRefresh.hash,
      lastActiveAt: new Date(),
      expiresAt: newRefresh.expiresAt,
      ipAddress: context.ipAddress,
      deviceInfo,
    });

    // Issue fresh access token
    const newAccessToken = await JwtUtil.generateAccessToken({
      userId: String(user._id),
      email: user.email,
      role: user.role,
      sessionId: String(session._id),
      securityStamp: user.securityStamp,
    });

    return {
      accessToken: newAccessToken,
      newRefreshToken: newRefresh.token,
    };
  }

  async logout(sessionId: string, jti: string): Promise<void> {
    await Promise.all([
      this.sessionRepository.revokeSession(sessionId),
      TokenBlocklistService.blockToken(jti)
    ]);
  }

  async verifyEmail(token: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const verification = await this.emailVerificationRepository.findByTokenHash(tokenHash);

    if (!verification) {
      throw new BadRequestError('Invalid or already used verification token');
    }

    if (verification.expiresAt < new Date()) {
      throw new BadRequestError('Verification token has expired');
    }

    const user = await this.userRepository.findById(String(verification.userId));
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.isEmailVerified) {
      await this.emailVerificationRepository.markAsUsed(String(verification._id));
      throw new BadRequestError('Email is already verified');
    }

    await this.userRepository.update(String(user._id), {
      isEmailVerified: true,
      status: 'active',
    });

    await this.emailVerificationRepository.markAsUsed(String(verification._id));
    
    // Changing status to active rotates securityStamp implicitly in next login
  }

  async resendVerification(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      // Do not reveal user existence — simply return success
      return;
    }

    if (user.isEmailVerified) {
      // Silent return — do not reveal verification status to the caller.
      // Same response whether: user not found, already verified, or email sent.
      return;
    }

    // Revoke previous pending tokens
    await this.emailVerificationRepository.revokePendingForUser(String(user._id));

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.emailVerificationRepository.create({
      userId: user._id,
      tokenHash,
      expiresAt,
    });

    // Dev: log the token so it can be used without an actual email
    if (envConfig.isDevelopment) {
      logger.info({ email: user.email, token }, '[Dev] Verification token re-generated');
    }

    // Send real email (no-op if RESEND_API_KEY not configured)
    const appUrl = envConfig.APP_URL;
    await emailService.sendVerificationEmail({
      to: user.email,
      name: user.name,
      token,
      appUrl,
    });
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      // Do not reveal user existence
      return;
    }

    if (user.status === 'suspended') {
      return;
    }

    // Revoke previous pending tokens
    await this.passwordResetRepository.revokePendingForUser(String(user._id));

    // Generate secure 32-byte token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

    await this.passwordResetRepository.create({
      userId: user._id,
      tokenHash,
      expiresAt,
    });

    // Dev: log the token so it can be used without an actual email
    if (envConfig.isDevelopment) {
      logger.info({ email: user.email, token }, '[Dev] Password reset token generated');
    }

    // Send real email (no-op if RESEND_API_KEY not configured)
    const appUrl = envConfig.APP_URL;
    await emailService.sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      token,
      appUrl,
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const resetDoc = await this.passwordResetRepository.findByTokenHash(tokenHash);

    if (!resetDoc) {
      throw new BadRequestError('Invalid or already used password reset token');
    }

    if (resetDoc.expiresAt < new Date()) {
      throw new BadRequestError('Password reset token has expired');
    }

    const user = await this.userRepository.findById(String(resetDoc.userId));
    if (!user || user.status === 'suspended') {
      throw new BadRequestError('Invalid user or account suspended');
    }

    const hashedPassword = await Argon2Util.hash(newPassword);

    // Rotate securityStamp to invalidate all existing sessions instantly
    const newStamp = crypto.randomUUID();

    await this.userRepository.update(String(user._id), {
      password: hashedPassword,
      securityStamp: newStamp,
    });

    // Invalidate security stamp in Redis cache
    await SecurityStampCache.invalidate(String(user._id));
    
    // Revoke all sessions in the DB — securityStamp rotation above already
    // invalidates JWT validation at the middleware level, but this keeps the
    // DB consistent and surfaces the revocation in the active sessions list.
    await this.sessionRepository.revokeAllSessions(String(user._id));

    await this.passwordResetRepository.markAsUsed(String(resetDoc._id));
  }

  /**
   * Returns the hydrated user profile from the database.
   * Used by the /me endpoint — returns actual user data, not just JWT claims.
   */
  async getProfile(userId: string): Promise<Omit<IUser, 'password'>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  async getUserSessions(userId: string): Promise<PublicSession[]> {
    const sessions = await this.sessionRepository.findActiveByUserId(userId);
    return sessions.map(toPublicSession);
  }

  async revokeSession(sessionId: string, userId: string): Promise<void> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session || String(session.userId) !== userId) {
      throw new NotFoundError('Session not found');
    }
    await this.sessionRepository.revokeSession(sessionId);
  }

  async revokeOtherSessions(userId: string, currentSessionId: string): Promise<void> {
    await this.sessionRepository.revokeUserOtherSessions(userId, currentSessionId);
  }

  /**
   * Creates session + tokens in a SINGLE database write.
   *
   * GAP-5 fix: Pre-generate the MongoDB ObjectId BEFORE creating the session.
   * This allows us to sign the refresh token with the real session._id upfront,
   * eliminating the placeholder-hash → update two-write pattern.
   */
  private async createSessionAndTokens(
    user: IUser,
    context: ClientContext
  ): Promise<AuthSessionResult> {
    const familyId = crypto.randomUUID();
    const deviceInfo = DeviceParserUtil.parse(context.userAgent);

    // Pre-generate the MongoDB _id — this is the key to the single-write pattern
    const sessionId = new Types.ObjectId();

    // Generate refresh token signed with the pre-generated session ID
    const refreshTokenData = await JwtUtil.generateRefreshToken({
      userId: String(user._id),
      sessionId: String(sessionId),
      familyId,
    });

    // Generate access token — also async (jose)
    const accessToken = await JwtUtil.generateAccessToken({
      userId: String(user._id),
      email: user.email,
      role: user.role,
      sessionId: String(sessionId),
      securityStamp: user.securityStamp,
    });

    // SINGLE database write — session created with the real hash immediately
    const session = await this.sessionRepository.create({
      _id: sessionId,
      userId: user._id,
      refreshTokenHash: refreshTokenData.hash,
      familyId,
      deviceInfo,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      lastActiveAt: new Date(),
      expiresAt: refreshTokenData.expiresAt,
      isRevoked: false,
    });

    const { password: _, ...safeUser } = user;

    return {
      user: safeUser,
      accessToken,
      refreshToken: refreshTokenData.token,
      session: toPublicSession(session),
      requiresEmailVerification: false,
    };
  }
}
