import { z } from 'zod';
import {
  loginSchema as sharedLoginSchema,
  forgotPasswordSchema as sharedForgotSchema,
  passwordSchema,
  verifyEmailBodySchema,
} from '@vami/schemas';

/**
 * Client form schemas — API fields aligned with packages/schemas;
 * confirmPassword is UI-only.
 */

export const loginSchema = sharedLoginSchema;

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be at most 50 characters')
      .trim(),
    username: z
      .string()
      .trim()
      .optional()
      .refine(
        (val) => !val || (val.length >= 3 && val.length <= 20 && /^[a-z0-9_]+$/.test(val)),
        {
          message: 'Username must be 3-20 characters (lowercase letters, numbers, and underscores)',
        }
      ),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = sharedForgotSchema;

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const verifyEmailSchema = verifyEmailBodySchema;

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;
