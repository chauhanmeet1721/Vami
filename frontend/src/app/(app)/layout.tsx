/**
 * App Layout — applies authentication protection to all pages in (app)/.
 *
 * Any page nested under (app)/ (chat, settings, profile, etc.)
 * will redirect unauthenticated users to /login automatically.
 *
 * The route group name (app) does NOT appear in the URL.
 * /app/(app)/chat/page.tsx → URL: /chat
 */
import { ProtectedRoute, FeatureErrorBoundary } from '@/components/atomic/templates';
import { Flex } from '@/components/atomic/layout/flex';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute redirectTo="/login">
      <FeatureErrorBoundary>
        <Flex className="h-full">
          {children}
        </Flex>
      </FeatureErrorBoundary>
    </ProtectedRoute>
  );
}
