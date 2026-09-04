/**
 * Auth Layout — applies guest-only route protection to all pages in (auth)/.
 *
 * Any page nested under (auth)/ (login, register, forgot-password, etc.)
 * will redirect authenticated users to / automatically.
 *
 * The route group name (auth) does NOT appear in the URL.
 * /app/(auth)/login/page.tsx → URL: /login
 */
import { ProtectedRoute, FeatureErrorBoundary } from '@/components/atomic/templates';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute guestOnly authenticatedRedirectTo="/">
      <FeatureErrorBoundary>
        {children}
      </FeatureErrorBoundary>
    </ProtectedRoute>
  );
}
