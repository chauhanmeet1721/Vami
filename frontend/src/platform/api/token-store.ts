/**
 * In-memory access token store.
 *
 * Backend returns `accessToken` in JSON body (not a cookie).
 * Master Framework §36: do NOT put session tokens in localStorage.
 * Refresh stays in httpOnly `refreshToken` cookie set by the API.
 */
let accessToken: string | null = null;

export const tokenStore = {
  get(): string | null {
    return accessToken;
  },
  set(token: string | null): void {
    accessToken = token;
  },
  clear(): void {
    accessToken = null;
  },
};
