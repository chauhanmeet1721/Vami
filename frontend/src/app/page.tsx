import {
  HomeDashboard,
  RequireAuth,
} from "@/features/auth";

export default function HomePage() {
  return (
    <RequireAuth>
      <HomeDashboard />
    </RequireAuth>
  );
}
