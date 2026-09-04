import { Request, Response, NextFunction } from 'express';
import { AuthService, ClientContext } from '../services/auth.service';
import { ApiResponse } from '../../../core/utils/response.util';
import { UnauthorizedError } from '../../../core/errors/app-error';
import { envConfig } from '../../../core/config/env.config';
import { JwtUtil } from '../../../core/utils/jwt.util';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private extractContext(req: Request): ClientContext {
    return {
      userAgent: req.headers['user-agent'] || 'Unknown',
      // Prefer Express req.ip when trust proxy is configured
      ipAddress: req.ip || req.socket.remoteAddress || 'Unknown',
    };
  }

  private setRefreshTokenCookie(res: Response, token: string): void {
    const isCrossDomain = envConfig.isProduction || envConfig.isPreview;
    const maxAgeMs = JwtUtil.parseDurationSeconds(envConfig.JWT_REFRESH_EXPIRES_IN) * 1000;
    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: isCrossDomain,
      sameSite: isCrossDomain ? 'none' : 'lax',
      maxAge: maxAgeMs,
      path: '/',
    });
  }

  private clearRefreshTokenCookie(res: Response): void {
    const isCrossDomain = envConfig.isProduction || envConfig.isPreview;
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isCrossDomain,
      sameSite: isCrossDomain ? 'none' : 'lax',
      path: '/',
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isCrossDomain,
      sameSite: isCrossDomain ? 'none' : 'lax',
      path: '/api/auth',
    });
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const context = this.extractContext(req);
      const result = await this.authService.register(req.body, context);

      if (result.requiresEmailVerification || !result.refreshToken || !result.accessToken) {
        ApiResponse.success(
          res,
          {
            user: result.user,
            requiresEmailVerification: true,
          },
          'Account created. Please verify your email before signing in.',
          201
        );
        return;
      }

      this.setRefreshTokenCookie(res, result.refreshToken);

      ApiResponse.success(
        res,
        {
          user: result.user,
          accessToken: result.accessToken,
          session: result.session,
        },
        'User registered successfully',
        201
      );
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const context = this.extractContext(req);
      const result = await this.authService.login(req.body, context);
      if (!result.refreshToken || !result.accessToken) {
        throw new UnauthorizedError('Authentication failed');
      }
      this.setRefreshTokenCookie(res, result.refreshToken);

      ApiResponse.success(
        res,
        {
          user: result.user,
          accessToken: result.accessToken,
          session: result.session,
        },
        'Login successful',
        200
      );
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!token) {
        throw new UnauthorizedError('Refresh token missing');
      }

      const context = this.extractContext(req);
      const result = await this.authService.refresh(token, context);
      this.setRefreshTokenCookie(res, result.newRefreshToken);

      ApiResponse.success(
        res,
        { accessToken: result.accessToken },
        'Token refreshed successfully',
        200
      );
    } catch (error) {
      // Clear cookie if refresh fails
      this.clearRefreshTokenCookie(res);
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.sessionId && req.user?.jti) {
        await this.authService.logout(req.sessionId, req.user.jti);
      }
      this.clearRefreshTokenCookie(res);
      ApiResponse.success(res, null, 'Logged out successfully', 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Body is already validated by verifyEmailBodySchema via validate() middleware.
   * No manual field checks needed here.
   */
  verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.authService.verifyEmail(req.body.token);
      ApiResponse.success(res, null, 'Email verified successfully', 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Body is already validated by resendVerificationSchema via validate() middleware.
   */
  resendVerification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.authService.resendVerification(req.body.email);
      ApiResponse.success(res, null, 'Verification email sent', 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Body is already validated by forgotPasswordSchema via validate() middleware.
   */
  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.authService.forgotPassword(req.body.email);
      ApiResponse.success(
        res,
        null,
        'If an account with this email exists, a password reset link has been sent.',
        200
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Body is already validated by resetPasswordBodySchema via validate() middleware.
   */
  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.authService.resetPassword(req.body.token, req.body.newPassword);
      ApiResponse.success(res, null, 'Password reset successfully', 200);
    } catch (error) {
      next(error);
    }
  };

  getSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sessions = await this.authService.getUserSessions(req.user!.userId);
      ApiResponse.success(res, sessions, 'Active sessions retrieved', 200);
    } catch (error) {
      next(error);
    }
  };

  revokeSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.authService.revokeSession(req.params.id as string, req.user!.userId);
      ApiResponse.success(res, null, 'Session revoked successfully', 200);
    } catch (error) {
      next(error);
    }
  };

  revokeOtherSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.authService.revokeOtherSessions(req.user!.userId, req.sessionId!);
      ApiResponse.success(res, null, 'All other sessions revoked successfully', 200);
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profile = await this.authService.getProfile(req.user!.userId);
      ApiResponse.success(
        res,
        {
          user: profile,
          activeSessionId: req.sessionId,
        },
        'User profile retrieved',
        200
      );
    } catch (error) {
      next(error);
    }
  };
}
