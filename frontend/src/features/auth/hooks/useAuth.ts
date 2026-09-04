'use client';

import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from '../providers/AuthProvider';

/**
 * useAuth — consumes the global AuthContext.
 *
 * Throws if called outside of <AuthProvider>.
 * This is intentional: every component that calls useAuth must be
 * rendered inside the provider tree. Failing loudly at dev time
 * is better than silently receiving undefined state.
 *
 * Usage:
 *   const { user, isAuthenticated, isLoading, login, logout } = useAuth();
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      '[useAuth] must be used inside <AuthProvider>. ' +
      'Wrap your application root (or the relevant layout) with <AuthProvider>.'
    );
  }
  return context;
}
