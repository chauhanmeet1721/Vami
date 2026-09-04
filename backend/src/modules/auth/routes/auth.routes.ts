import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../../../core/middlewares/validate.middleware';
import { authenticate } from '../../../core/middlewares/auth.middleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordBodySchema,
  verifyEmailBodySchema,
  resendVerificationSchema,
  refreshBodySchema,
} from '../dtos/auth.dto';
import {
  loginRateLimiter,
  registerRateLimiter,
  refreshRateLimiter,
  forgotPasswordRateLimiter,
  resendVerificationRateLimiter,
  resetPasswordRateLimiter,
  verifyEmailRateLimiter,
} from '../../../core/middlewares/rate-limit.middleware';

export const createAuthRouter = (authController: AuthController): Router => {
  const router = Router();

  // ── Public Endpoints — rate limited + validated ───────────────────────────
  router.post('/register', registerRateLimiter, validate(registerSchema), authController.register);
  router.post('/login', loginRateLimiter, validate(loginSchema), authController.login);
  router.post(
    '/refresh',
    refreshRateLimiter,
    validate(refreshBodySchema),
    authController.refresh
  );

  // ── Email Verification ────────────────────────────────────────────────────
  router.post(
    '/verify-email',
    verifyEmailRateLimiter,
    validate(verifyEmailBodySchema),
    authController.verifyEmail
  );
  router.post(
    '/resend-verification',
    resendVerificationRateLimiter,
    validate(resendVerificationSchema),
    authController.resendVerification
  );

  // ── Password Reset ────────────────────────────────────────────────────────
  router.post(
    '/forgot-password',
    forgotPasswordRateLimiter,
    validate(forgotPasswordSchema),
    authController.forgotPassword
  );
  router.post(
    '/reset-password',
    resetPasswordRateLimiter,
    validate(resetPasswordBodySchema),
    authController.resetPassword
  );

  // ── Authenticated Endpoints ───────────────────────────────────────────────
  router.get('/me', authenticate, authController.me);
  router.post('/logout', authenticate, authController.logout);

  // ── Multi-Device Session Management (SSO) ────────────────────────────────
  router.get('/sessions', authenticate, authController.getSessions);
  router.delete('/sessions/:id', authenticate, authController.revokeSession);
  router.post('/sessions/revoke-others', authenticate, authController.revokeOtherSessions);

  return router;
};
