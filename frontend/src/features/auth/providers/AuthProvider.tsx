'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { authApi } from '../api/auth.api';
import { ApiClient } from '@/core/api-client';
import type { UserProfile } from '../types';

// ─── State Shape ─────────────────────────────────────────────────────────────

interface AuthState {
  user: UserProfile | null;
  activeSessionId: string | null;
  isAuthenticated: boolean;
  /**
   * True only during the initial boot-time session restore.
   * Stays false permanently after the first check completes.
   * login/register/logout loading states are managed by their own
   * useMutation hooks — never here — to keep this context lean.
   */
  isLoading: boolean;
}

// ─── Actions ─────────────────────────────────────────────────────────────────

type AuthAction =
  | { type: 'INIT_START' }
  | { type: 'INIT_SUCCESS'; payload: { user: UserProfile; activeSessionId: string } }
  | { type: 'INIT_FAILURE' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: UserProfile; accessToken: string; activeSessionId?: string } }
  | { type: 'LOGOUT' };

const initialState: AuthState = {
  user: null,
  activeSessionId: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'INIT_START':
      return { ...state, isLoading: true };

    case 'INIT_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        activeSessionId: action.payload.activeSessionId,
        isAuthenticated: true,
        isLoading: false,
      };

    case 'INIT_FAILURE':
      return { ...initialState, isLoading: false };

    case 'LOGIN_SUCCESS':
      // Set the access token in memory when login/register succeeds
      ApiClient.setAccessToken(action.payload.accessToken);
      return {
        ...state,
        user: action.payload.user,
        activeSessionId: action.payload.activeSessionId ?? null,
        isAuthenticated: true,
        isLoading: false,
      };

    case 'LOGOUT':
      // Clear the access token from memory on logout
      ApiClient.setAccessToken(null);
      return { ...initialState, isLoading: false };

    default:
      return state;
  }
}

// ─── Contexts ─────────────────────────────────────────────────────────────────

/**
 * AuthContext — read-only identity state.
 * Consumed via useAuth() for UI rendering decisions.
 *
 * Architecture Rule 16: AuthProvider holds identity state ONLY.
 * It does NOT call login/register/logout APIs.
 * Those live in useMutation hooks (useLoginMutation, etc.).
 */
type AuthContextValue = AuthState;

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * AuthDispatchContext — exposes the raw dispatch function.
 * Consumed by useLoginMutation, useRegisterMutation, useLogoutMutation
 * to notify the context after API calls complete.
 *
 * Separation of read (AuthContext) from write (AuthDispatchContext) is the
 * recommended pattern for contexts with complex state — avoids unnecessary
 * re-renders in components that only read identity.
 */
const AuthDispatchContext = createContext<React.Dispatch<AuthAction> | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * AuthProvider
 *
 * Responsibilities:
 *   1. Boot-time session restore: /refresh → /me (efficient, no double-request)
 *   2. Register ApiClient.onUnauthenticated for mid-session expiry handling
 *   3. Expose identity state via AuthContext
 *   4. Expose dispatch via AuthDispatchContext (for mutation hooks)
 *
 * NOT responsible for:
 *   - Calling login / register / logout APIs
 *   - Managing form loading/error state
 *   - Navigation (handled by ProtectedRoute + middleware.ts)
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * Boot-time session restore.
   *
   * Fixed sequence (vs old pattern):
   *   OLD: /me → 401 → ApiClient retries → /refresh → /me (2 extra roundtrips on every page load)
   *   NEW: /refresh → /me (1 roundtrip — clean, predictable, explicit)
   *
   * On page refresh, inMemoryAccessToken is null. We call /refresh first to
   * get a fresh access token via the HttpOnly cookie, then /me to get the user.
   * If /refresh fails, the session is expired — dispatch INIT_FAILURE.
   */
  useEffect(() => {
    let cancelled = false;

    const initAuth = async () => {
      dispatch({ type: 'INIT_START' });

      /**
       * Performance optimization — mirrors the pattern used by Supabase, Auth.js, Clerk.
       *
       * `vami_session` is a client-readable cookie set on login/register and cleared on logout.
       * If it is absent, the user has no session — skip the /refresh round-trip entirely.
       * This eliminates a guaranteed 401 for every unauthenticated page view.
       *
       * Security note: this is a performance heuristic only. The actual authentication
       * is enforced by the HttpOnly `refreshToken` cookie + JWT verification on the backend.
       * Absence of `vami_session` can never grant access — it only avoids a wasted request.
       */
      const hasSessionIndicator =
        typeof document !== 'undefined' &&
        document.cookie.includes('vami_session=true');

      if (!hasSessionIndicator) {
        dispatch({ type: 'INIT_FAILURE' });
        return;
      }

      try {
        // Step 1: Restore access token via HttpOnly cookie
        const refreshRes = await authApi.refresh();
        if (cancelled) return;

        if (!refreshRes.success || !refreshRes.data?.accessToken) {
          // No valid session — fresh visitor or expired session
          dispatch({ type: 'INIT_FAILURE' });
          return;
        }

        // Step 2: Fetch identity with the fresh access token
        const meRes = await authApi.getMe();
        if (cancelled) return;

        if (meRes.success && meRes.data) {
          dispatch({
            type: 'INIT_SUCCESS',
            payload: {
              user: meRes.data.user,
              activeSessionId: meRes.data.activeSessionId,
            },
          });
        } else {
          dispatch({ type: 'INIT_FAILURE' });
        }
      } catch {
        if (!cancelled) dispatch({ type: 'INIT_FAILURE' });
      }
    };

    initAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Register the global 401 handler.
   *
   * Architecture Rule 15: When the refresh token expires mid-session and
   * ApiClient.refreshAccessToken() fails, this callback dispatches LOGOUT,
   * clearing the auth state and triggering ProtectedRoute to redirect to /login.
   * No individual component needs to handle 401 errors.
   */
  useEffect(() => {
    ApiClient.onUnauthenticated = () => dispatch({ type: 'LOGOUT' });

    return () => {
      ApiClient.onUnauthenticated = null;
    };
  }, []);

  // ─── Context Values ────────────────────────────────────────────────────────

  const value = useMemo<AuthContextValue>(
    () => ({ ...state }),
    [state]
  );

  return (
    <AuthDispatchContext.Provider value={dispatch}>
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    </AuthDispatchContext.Provider>
  );
}


/**
 * useAuthDispatch — access the dispatch function (write-only).
 * Use in useMutation hooks (useLoginMutation, useRegisterMutation, etc.)
 * to notify the context after an API call succeeds.
 */
export function useAuthDispatch(): React.Dispatch<AuthAction> {
  const context = useContext(AuthDispatchContext);
  if (!context) {
    throw new Error(
      '[useAuthDispatch] must be used within <AuthProvider>.'
    );
  }
  return context;
}

// ─── Raw Context Export (for useAuth hook in separate file) ───────────────────

export { AuthContext, AuthDispatchContext };
export type { AuthAction, AuthContextValue };
