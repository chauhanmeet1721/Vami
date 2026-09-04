import { env } from '../env.mjs';

export const APP_CONFIG = {
  API_BASE_URL: env.NEXT_PUBLIC_API_URL,
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    SESSIONS: '/auth/sessions',
    REVOKE_SESSION: (id: string) => `/auth/sessions/${id}`,
    REVOKE_OTHER_SESSIONS: '/auth/sessions/revoke-others',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
  },
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
  },
} as const;
