import type {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResendVerificationDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from "@vami/schemas";
import { api } from "@/platform/api";
import type {
  AuthSuccessData,
  MeData,
  PublicSession,
  RegisterResult,
} from "@/features/auth/types";

/**
 * Auth API — paths and payloads match backend auth.routes.ts / auth.controller.ts.
 * No invented endpoints.
 */
export const authApi = {
  register(body: RegisterDto) {
    return api.post<RegisterResult>("/api/auth/register", body, {
      skipAuth: true,
    });
  },

  login(body: LoginDto) {
    return api.post<AuthSuccessData>("/api/auth/login", body, {
      skipAuth: true,
    });
  },

  logout() {
    return api.post<null>("/api/auth/logout", undefined);
  },

  me() {
    return api.get<MeData>("/api/auth/me");
  },

  verifyEmail(body: VerifyEmailDto) {
    return api.post<null>("/api/auth/verify-email", body, { skipAuth: true });
  },

  resendVerification(body: ResendVerificationDto) {
    return api.post<null>("/api/auth/resend-verification", body, {
      skipAuth: true,
    });
  },

  forgotPassword(body: ForgotPasswordDto) {
    return api.post<null>("/api/auth/forgot-password", body, {
      skipAuth: true,
    });
  },

  resetPassword(body: ResetPasswordDto) {
    return api.post<null>("/api/auth/reset-password", body, {
      skipAuth: true,
    });
  },

  listSessions() {
    return api.get<PublicSession[]>("/api/auth/sessions");
  },

  revokeSession(id: string) {
    return api.delete<null>(`/api/auth/sessions/${encodeURIComponent(id)}`);
  },

  revokeOtherSessions() {
    return api.post<null>("/api/auth/sessions/revoke-others", undefined);
  },
};
