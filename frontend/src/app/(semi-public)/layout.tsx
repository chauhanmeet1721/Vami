/**
 * Semi-Public Layout — no route protection applied.
 *
 * Pages in (semi-public)/ are accessible to BOTH authenticated and
 * unauthenticated users. The individual page components are responsible
 * for rendering context-appropriate UI based on auth state.
 *
 * Current semi-public pages:
 *   - /verify-email — needs to be reachable by:
 *       • Unauthenticated users who clicked a verification link from email
 *       • Authenticated users whose email is still unverified (status: 'pending')
 *
 * The route group name (semi-public) does NOT appear in the URL.
 * /app/(semi-public)/verify-email/page.tsx → URL: /verify-email
 */
import { FeatureErrorBoundary } from '@/components/atomic/templates';

export default function SemiPublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FeatureErrorBoundary>
      {children}
    </FeatureErrorBoundary>
  );
}
