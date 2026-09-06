import { env } from "@/platform/config/env";
import { ApiError, type ApiResponsePayload } from "@/platform/api/errors";
import { tokenStore } from "@/platform/api/token-store";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  /** Skip Authorization header (login/register/refresh/public). */
  skipAuth?: boolean;
  /** Skip one-shot 401 → refresh → retry (used by refresh itself). */
  skipRefreshRetry?: boolean;
  signal?: AbortSignal;
};

let refreshInFlight: Promise<boolean> | null = null;

/**
 * Single-flight refresh using the httpOnly cookie.
 * Endpoint: POST /api/auth/refresh (backend auth.controller.ts).
 * Exported for bootstrap (/me after hard reload) — same path as 401 retry.
 */
export async function refreshAccessToken(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const response = await fetch(`${env.apiUrl}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        // Body optional — cookie preferred; empty object satisfies refreshBodySchema
        body: JSON.stringify({}),
      });

      const payload = (await response.json().catch(() => null)) as
        | ApiResponsePayload<{ accessToken: string }>
        | null;

      if (!response.ok || !payload?.success || !payload.data?.accessToken) {
        tokenStore.clear();
        return false;
      }

      tokenStore.set(payload.data.accessToken);
      return true;
    } catch {
      tokenStore.clear();
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

async function parsePayload<T>(response: Response): Promise<ApiResponsePayload<T>> {
  const text = await response.text();
  if (!text) {
    return { success: response.ok };
  }
  try {
    return JSON.parse(text) as ApiResponsePayload<T>;
  } catch {
    throw new ApiError("Malformed JSON response from API", response.status);
  }
}

/**
 * Typed fetch against the Express API.
 * - credentials: include (refresh cookie)
 * - Bearer access token from memory
 * - On 401 (once): refresh via cookie, retry original request
 */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    skipAuth = false,
    skipRefreshRetry = false,
    signal,
  } = options;

  const headers = new Headers();
  headers.set("Accept", "application/json");
  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (!skipAuth) {
    const token = tokenStore.get();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${env.apiUrl}${path}`, {
    method,
    headers,
    credentials: "include",
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  if (response.status === 401 && !skipAuth && !skipRefreshRetry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiRequest<T>(path, { ...options, skipRefreshRetry: true });
    }
  }

  const payload = await parsePayload<T>(response);

  if (!response.ok || payload.success === false) {
    throw new ApiError(
      payload.message || `Request failed (${response.status})`,
      response.status,
      payload.details,
    );
  }

  return payload.data as T;
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: "DELETE" }),
};
