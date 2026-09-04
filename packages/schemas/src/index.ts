import { z } from 'zod';

/** Shared password rules — single source for FE forms and BE DTOs. */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores')
    .optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('A valid email address is required'),
});

export const resetPasswordBodySchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: passwordSchema,
});

export const verifyEmailBodySchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export const resendVerificationSchema = z.object({
  email: z.string().email('A valid email address is required'),
});

export const refreshBodySchema = z.object({
  refreshToken: z.string().min(1).optional(),
});

export type LoginDto = z.infer<typeof loginSchema>;
export type RegisterDto = z.infer<typeof registerSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordBodySchema>;
export type VerifyEmailDto = z.infer<typeof verifyEmailBodySchema>;
export type ResendVerificationDto = z.infer<typeof resendVerificationSchema>;
export type RefreshDto = z.infer<typeof refreshBodySchema>;
