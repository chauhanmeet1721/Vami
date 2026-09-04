import { APP_CONFIG, API_ENDPOINTS } from './constants';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  details?: unknown;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export class ApiClient {
  private static baseUrl = APP_CONFIG.API_BASE_URL;

  /**
   * Access token stored in MEMORY ONLY.
   *
   * Security rationale: sessionStorage and localStorage are accessible to JavaScript
   * and are therefore XSS-readable. Memory is not. The trade-off is that memory is
   * cleared on page refresh — handled transparently by the AuthProvider boot sequence:
   *   1. On mount: call /auth/refresh (HttpOnly cookie) → get new access token
   *   2. Then call /auth/me → populate identity state
   *
   * sessionStorage is FORBIDDEN for tokens (Architecture Rule 11).
   */
  private static inMemoryAccessToken: string | null = null;

  /**
   * Deduplicates concurrent refresh requests.
   * If 3 tabs all hit 401 simultaneously, only one /refresh call goes out.
   */
  private static refreshPromise: Promise<string | null> | null = null;

  /**
   * Callback registered by AuthProvider on mount.
   * Called when refresh fails mid-session (expired session) so the context
   * can dispatch LOGOUT and redirect to login without each component handling 401 itself.
   *
   * Architecture Rule 15: No component implements 401 handling directly.
   */
  static onUnauthenticated: (() => void) | null = null;

  static setAccessToken(token: string | null): void {
    this.inMemoryAccessToken = token;
    // NOTE: No sessionStorage. Memory only.
  }

  static getAccessToken(): string | null {
    return this.inMemoryAccessToken;
  }

  /**
   * Transparently refreshes access token using the HttpOnly refresh cookie.
   * Concurrent calls are deduplicated via refreshPromise.
   * If refresh fails, onUnauthenticated is called to notify AuthProvider.
   */
  private static async refreshAccessToken(): Promise<string | null> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      try {
        const res = await fetch(`${this.baseUrl}${API_ENDPOINTS.AUTH.REFRESH}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (!res.ok) {
          this.setAccessToken(null);
          // Notify AuthProvider that the session is gone (mid-session expiry)
          this.onUnauthenticated?.();
          return null;
        }

        const data: ApiResponse<{ accessToken: string }> = await res.json();
        if (data.success && data.data?.accessToken) {
          this.setAccessToken(data.data.accessToken);
          return data.data.accessToken;
        }

        this.setAccessToken(null);
        this.onUnauthenticated?.();
        return null;
      } catch {
        this.setAccessToken(null);
        this.onUnauthenticated?.();
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  static async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = this.getAccessToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Ensures HttpOnly cookies are sent across origins
    });

    // Handle 401 Unauthorized with automatic refresh token rotation
    // Skip refresh for auth endpoints to prevent infinite loops
    if (
      response.status === 401 &&
      !isRetry &&
      !endpoint.includes(API_ENDPOINTS.AUTH.LOGIN) &&
      !endpoint.includes(API_ENDPOINTS.AUTH.REFRESH)
    ) {
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        // Retry the original request with the new token
        return this.request<T>(endpoint, options, true);
      }
      // refreshAccessToken already called onUnauthenticated — nothing else to do
      throw new ApiError('Session expired. Please log in again.', 401);
    }

    const data: ApiResponse<T> = await response.json().catch(() => ({
      success: false,
      message: 'Failed to parse response body',
    }));

    if (!response.ok || !data.success) {
      throw new ApiError(
        data.message || `Request failed with status ${response.status}`,
        response.status,
        data.details
      );
    }

    return data;
  }

  static get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  static post<T>(
    endpoint: string,
    body: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  static patch<T>(
    endpoint: string,
    body: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  static delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}
