import { RequireAuth, SessionsPanel } from "@/features/auth";

export default function SessionsPage() {
  return (
    <RequireAuth>
      <SessionsPanel />
    </RequireAuth>
  );
}
