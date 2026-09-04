'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { AppLoadingScreen } from './AppLoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Where to redirect unauthenticated users.
   * Defaults to '/login'.
   */
  redirectTo?: string;
  /**
   * If true, this route is for unauthenticated users only (e.g. /login, /register).
   * Authenticated users will be redirected to `authenticatedRedirectTo`.
   */
  guestOnly?: boolean;
  /**
   * Where to redirect authenticated users when `guestOnly` is true.
   * Defaults to '/'.
   */
  authenticatedRedirectTo?: string;
}

/**
 * ProtectedRoute — a layout-level route guard.
 *
 * Defense layer 2 of 3 (after edge middleware, before API auth):
 * Performs client-side auth checks after hydration. Complements
 * middleware.ts which runs at the edge before any rendering.
 *
 * Usage in a Next.js layout or page:
 *
 * // Protected page: requires authentication
 * <ProtectedRoute>
 *   <ChatPage />
 * </ProtectedRoute>
 *
 * // Guest-only page: authenticated users are redirected away
 * <ProtectedRoute guestOnly authenticatedRedirectTo="/">
 *   <LoginPage />
 * </ProtectedRoute>
 *
 * While the initial auth check is in progress (isLoading), renders
 * <AppLoadingScreen /> — a branded skeleton UI instead of a blank screen.
 */
export function ProtectedRoute({
  children,
  redirectTo = '/login',
  guestOnly = false,
  authenticatedRedirectTo = '/',
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !guestOnly) {
      // User is not logged in but the route requires auth → send to login
      router.replace(redirectTo);
    }

    if (isAuthenticated && guestOnly) {
      // User is already logged in but is trying to visit a guest page → redirect away
      router.replace(authenticatedRedirectTo);
    }
  }, [isAuthenticated, isLoading, guestOnly, redirectTo, authenticatedRedirectTo, router]);

  // While auth state is being determined, show branded loading screen
  if (isLoading) return <AppLoadingScreen />;

  // For guest-only routes, don't render until redirect has fired
  if (isAuthenticated && guestOnly) return <AppLoadingScreen />;

  // For protected routes, don't render until redirect has fired
  if (!isAuthenticated && !guestOnly) return <AppLoadingScreen />;

  return <>{children}</>;
}
