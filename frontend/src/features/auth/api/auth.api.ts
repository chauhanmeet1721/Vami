import { ApiClient, ApiResponse } from '@/core/api-client';
import { API_ENDPOINTS } from '@/core/constants';
import {
  AuthResponseData,
  LoginCredentials,
  RegisterPayload,
  UserProfile,
  ISession,
} from '../types';

function setClientSessionIndicator(): void {
  if (typeof document !== 'undefined') {
    const isSecure = window.location.protocol === 'https:';
    document.cookie = `vami_session=true; path=/; max-age=604800; SameSite=Lax${isSecure ? '; Secure' : ''}`;
  }
}

function clearClientSessionIndicator(): void {
  if (typeof document !== 'undefined') {
    document.cookie = 'vami_session=; path=/; max-age=0; SameSite=Lax';
  }
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponseData>> => {
    const res = await ApiClient.post<AuthResponseData>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    if (res.data?.accessToken) {
      ApiClient.setAccessToken(res.data.accessToken);
      setClientSessionIndicator();
    }
    return res;
  },

  register: async (payload: RegisterPayload): Promise<ApiResponse<AuthResponseData>> => {
    const res = await ApiClient.post<AuthResponseData>(API_ENDPOINTS.AUTH.REGISTER, payload);
    if (res.data?.accessToken) {
      ApiClient.setAccessToken(res.data.accessToken);
      setClientSessionIndicator();
    }
    return res;
  },

  logout: async (): Promise<ApiResponse<null>> => {
    try {
      return await ApiClient.post<null>(API_ENDPOINTS.AUTH.LOGOUT, {});
    } finally {
      ApiClient.setAccessToken(null);
      clearClientSessionIndicator();
    }
  },

  refresh: async (): Promise<ApiResponse<{ accessToken: string }>> => {
    const res = await ApiClient.post<{ accessToken: string }>(API_ENDPOINTS.AUTH.REFRESH, {});
    if (res.data?.accessToken) {
      ApiClient.setAccessToken(res.data.accessToken);
      setClientSessionIndicator();
    } else {
      clearClientSessionIndicator();
    }
    return res;
  },

  getMe: async (): Promise<ApiResponse<{ user: UserProfile; activeSessionId: string }>> => {
    return ApiClient.get<{ user: UserProfile; activeSessionId: string }>(API_ENDPOINTS.AUTH.ME);
  },

  getSessions: async (): Promise<ApiResponse<ISession[]>> => {
    return ApiClient.get<ISession[]>(API_ENDPOINTS.AUTH.SESSIONS);
  },

  revokeSession: async (sessionId: string): Promise<ApiResponse<null>> => {
    return ApiClient.delete<null>(API_ENDPOINTS.AUTH.REVOKE_SESSION(sessionId));
  },

  revokeOtherSessions: async (): Promise<ApiResponse<null>> => {
    return ApiClient.post<null>(API_ENDPOINTS.AUTH.REVOKE_OTHER_SESSIONS, {});
  },

  forgotPassword: async (email: string): Promise<ApiResponse<null>> => {
    return ApiClient.post<null>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse<null>> => {
    return ApiClient.post<null>(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, newPassword });
  },

  verifyEmail: async (token: string): Promise<ApiResponse<null>> => {
    return ApiClient.post<null>(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
  },

  resendVerification: async (email: string): Promise<ApiResponse<null>> => {
    return ApiClient.post<null>(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, { email });
  },
};
