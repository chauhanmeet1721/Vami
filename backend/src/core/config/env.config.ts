import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env file from process cwd
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'preview', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string().default('mongodb://127.0.0.1:27017/vami_db'),
  REDIS_URI: z.string().default('redis://127.0.0.1:6379'),
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 characters'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECRET: z.string().min(16, 'COOKIE_SECRET must be at least 16 characters').default('dev_cookie_secret_key_super_secure_32chars'),
  CORS_ORIGIN: z.string(),
  // Canonical frontend URL used for email verification/reset links.
  // Separate from CORS_ORIGIN — these can differ in CDN/load-balancer setups.
  APP_URL: z.string().url(),
  REQUIRE_EMAIL_VERIFICATION: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),
  // ── Email (Resend) ────────────────────────────────────────────────────────
  // Optional — if not set, email sends are skipped (no-op) in development.
  // Required in preview/production environments.
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().default('noreply@localhost.invalid'),
  // ── Rate Limiting ─────────────────────────────────────────────────────────
  RATE_LIMIT_LOGIN_MAX: z.coerce.number().default(5),
  RATE_LIMIT_REGISTER_MAX: z.coerce.number().default(3),
  RATE_LIMIT_API_MAX: z.coerce.number().default(100),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:');
  parsedEnv.error.issues.forEach((issue) => {
    console.error(` - ${issue.path.join('.')}: ${issue.message}`);
  });
  throw new Error('Environment validation failed. Please check your .env file.');
}

const rawConfig = parsedEnv.data;

export const envConfig = {
  ...rawConfig,
  isProduction: rawConfig.NODE_ENV === 'production',
  isPreview: rawConfig.NODE_ENV === 'preview',
  isDevelopment: rawConfig.NODE_ENV === 'development',
};
