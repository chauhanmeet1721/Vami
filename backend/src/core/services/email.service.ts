import { Resend } from 'resend';
import { envConfig } from '../config/env.config';
import { logger } from '../utils/logger';

/**
 * EmailService — Resend-backed transactional email sender.
 *
 * Behavior by environment:
 *   - No RESEND_API_KEY configured → logs a warning and no-ops all sends.
 *     This prevents local dev from crashing when the key isn't set.
 *   - RESEND_API_KEY configured → sends real emails via the Resend API.
 *
 * Local testing without a domain:
 *   Use Resend's built-in test addresses in your .env.development:
 *     TEST_EMAIL=delivered@resend.dev   — simulates successful delivery
 *     TEST_EMAIL=bounced@resend.dev     — simulates a hard bounce
 *
 * Production requirements:
 *   - Verified domain in Resend dashboard (SPF/DKIM/DMARC records)
 *   - EMAIL_FROM must match the verified domain (e.g. noreply@yourapp.com)
 *   - RESEND_API_KEY must be set in the environment
 */

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private client: Resend | null = null;

  constructor() {
    if (envConfig.RESEND_API_KEY) {
      this.client = new Resend(envConfig.RESEND_API_KEY);
    } else {
      logger.warn(
        '[EmailService] RESEND_API_KEY is not set. ' +
        'Email sends are disabled. Set RESEND_API_KEY in .env to enable.'
      );
    }
  }

  /**
   * Sends an email. If no API key is configured, logs and returns without sending.
   * Throws on Resend API errors so the caller can handle delivery failures.
   */
  async send(options: SendEmailOptions): Promise<void> {
    if (!this.client) {
      logger.warn(
        { to: options.to, subject: options.subject },
        '[EmailService] Skipping email send — no API key configured'
      );
      return;
    }

    const { data, error } = await this.client.emails.send({
      from: envConfig.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      logger.error(
        { error, to: options.to },
        '[EmailService] Failed to send email'
      );
      throw new Error(`Email delivery failed: ${error.message}`);
    }

    logger.info(
      { id: data?.id, to: options.to },
      '[EmailService] Email sent'
    );
  }

  /**
   * Sends an email verification email with a one-click verification link.
   */
  async sendVerificationEmail(params: {
    to: string;
    name: string;
    token: string;
    appUrl: string;
  }): Promise<void> {
    const verifyUrl = `${params.appUrl}/verify-email?token=${encodeURIComponent(params.token)}`;

    await this.send({
      to: params.to,
      subject: 'Verify your Vami email address',
      text: `Hi ${params.name},\n\nVerify your email by visiting:\n${verifyUrl}\n\nThis link expires in 24 hours.\n\nIf you didn't create a Vami account, you can safely ignore this email.`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(to bottom, #3390ec, #267fd9);">
              <span style="color: white; font-size: 24px;">✈</span>
            </div>
            <h1 style="color: #111827; font-size: 24px; font-weight: 700; margin: 16px 0 4px;">Verify your email</h1>
            <p style="color: #6b7280; font-size: 14px; margin: 0;">Hi ${params.name}, welcome to Vami!</p>
          </div>

          <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
            Click the button below to verify your email address and activate your account.
          </p>

          <div style="text-align: center; margin: 0 0 24px;">
            <a href="${verifyUrl}"
              style="display: inline-block; background: #3390ec; color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 15px; font-weight: 600;">
              Verify Email Address
            </a>
          </div>

          <p style="color: #9ca3af; font-size: 13px; margin: 0 0 8px;">
            Or copy this link into your browser:
          </p>
          <p style="color: #6b7280; font-size: 12px; word-break: break-all; margin: 0 0 24px;">${verifyUrl}</p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            This link expires in 24 hours. If you didn't create a Vami account, you can safely ignore this email.
          </p>
        </div>
      `,
    });
  }

  /**
   * Sends a password reset email with a one-click reset link.
   */
  async sendPasswordResetEmail(params: {
    to: string;
    name: string;
    token: string;
    appUrl: string;
  }): Promise<void> {
    const resetUrl = `${params.appUrl}/reset-password?token=${encodeURIComponent(params.token)}`;

    await this.send({
      to: params.to,
      subject: 'Reset your Vami password',
      text: `Hi ${params.name},\n\nReset your password by visiting:\n${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request a password reset, you can safely ignore this email.`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(to bottom, #3390ec, #267fd9);">
              <span style="color: white; font-size: 24px;">🔒</span>
            </div>
            <h1 style="color: #111827; font-size: 24px; font-weight: 700; margin: 16px 0 4px;">Reset your password</h1>
            <p style="color: #6b7280; font-size: 14px; margin: 0;">Hi ${params.name}</p>
          </div>

          <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
            We received a request to reset your Vami password. Click the button below to choose a new password.
          </p>

          <div style="text-align: center; margin: 0 0 24px;">
            <a href="${resetUrl}"
              style="display: inline-block; background: #3390ec; color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 15px; font-weight: 600;">
              Reset Password
            </a>
          </div>

          <p style="color: #9ca3af; font-size: 13px; margin: 0 0 8px;">
            Or copy this link into your browser:
          </p>
          <p style="color: #6b7280; font-size: 12px; word-break: break-all; margin: 0 0 24px;">${resetUrl}</p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email. Your password will not change.
          </p>
        </div>
      `,
    });
  }
}

// Singleton — one instance per Node process
export const emailService = new EmailService();
