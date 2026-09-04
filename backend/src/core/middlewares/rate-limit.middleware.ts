import rateLimit, { Options } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { envConfig } from '../config/env.config';
import { ApiResponse } from '../utils/response.util';
import { Request, Response, RequestHandler } from 'express';
import { RedisConnection } from '../database/redis.connection';

/**
 * Standard handler that returns a consistent ApiResponse when the rate limit is exceeded.
 * Ensures the client gets structured JSON rather than a plain text 429 response.
 */
const rateLimitHandler = (_req: Request, res: Response): void => {
  ApiResponse.error(
    res,
    'Too many requests. Please slow down and try again later.',
    429
  );
};

/**
 * Login rate limiter: max 5 attempts per 15 minutes per IP.
 * Blocks brute-force credential stuffing attacks.
 */
export const loginRateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => (RedisConnection.getClient().call as any)(...args),
    prefix: 'rl:login:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: envConfig.isDevelopment ? 100 : envConfig.RATE_LIMIT_LOGIN_MAX,
  standardHeaders: 'draft-7', // Return RateLimit-* headers (RFC 9110 draft)
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: 'Too many login attempts. Please try again in 15 minutes.',
  skipSuccessfulRequests: false,
});

/**
 * Register rate limiter: max 3 accounts per hour per IP.
 * Prevents mass account creation and spam registration.
 */
export const registerRateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => (RedisConnection.getClient().call as any)(...args),
    prefix: 'rl:register:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: envConfig.isDevelopment ? 100 : envConfig.RATE_LIMIT_REGISTER_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: 'Too many accounts created from this IP. Please try again in an hour.',
  skipSuccessfulRequests: false,
});

/**
 * Refresh token rate limiter: max 30 refreshes per 15 minutes per IP.
 * Prevents token refresh abuse without disrupting normal usage.
 */
export const refreshRateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => (RedisConnection.getClient().call as any)(...args),
    prefix: 'rl:refresh:',
  }),
  windowMs: 15 * 60 * 1000,
  max: envConfig.isDevelopment ? 500 : 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/**
 * Forgot password rate limiter: max 3 requests per hour per IP.
 * Prevents spamming users' inboxes with reset emails.
 */
export const forgotPasswordRateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => (RedisConnection.getClient().call as any)(...args),
    prefix: 'rl:forgot-pwd:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: envConfig.isDevelopment ? 100 : 3,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: 'Too many password reset requests. Please try again later.',
  skipSuccessfulRequests: false,
});

/**
 * Resend verification rate limiter: max 3 requests per hour per IP.
 * Prevents spamming any email address with verification emails.
 */
export const resendVerificationRateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => (RedisConnection.getClient().call as any)(...args),
    prefix: 'rl:resend-verify:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: envConfig.isDevelopment ? 100 : 3,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: 'Too many verification email requests. Please try again later.',
  skipSuccessfulRequests: false,
});

/**
 * Reset password rate limiter: max 10 requests per 15 minutes per IP.
 * Prevents resource exhaustion from parallel token-validation calls.
 */
export const resetPasswordRateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => (RedisConnection.getClient().call as any)(...args),
    prefix: 'rl:reset-pwd:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: envConfig.isDevelopment ? 100 : 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: 'Too many password reset attempts. Please try again later.',
  skipSuccessfulRequests: false,
});

/**
 * General API Limiter.
 * 100 requests per 1 minute per IP.
 */
export const apiLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => (RedisConnection.getClient().call as any)(...args),
    prefix: 'rl:api:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: envConfig.isDevelopment ? 1000 : envConfig.RATE_LIMIT_API_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: 'Too many requests. Please slow down and try again later.',
});
