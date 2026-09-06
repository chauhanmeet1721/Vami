"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authApi } from "@/features/auth/api/auth.api";
import { getAuthErrorMessage } from "@/features/auth/lib/error-message";
import { useAuth } from "@/features/auth/providers/AuthProvider";
import { DevicesIcon, SignOutIcon, SpinnerIcon } from "@/shared/icons";
import { Alert, Button, SurfaceCard } from "@/shared/ui";

export function HomeDashboard() {
  const { user, clearSession } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const onLogout = async () => {
    setError(null);
    setLoggingOut(true);
    try {
      await authApi.logout();
    } catch (err) {
      setError(getAuthErrorMessage(err, "Logout request failed."));
    } finally {
      clearSession();
      setLoggingOut(false);
      router.replace("/login");
    }
  };

  if (!user) return null;

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-6 p-6">
      <SurfaceCard title={`Welcome, ${user.name}`}>
        <dl className="space-y-2 text-sm opacity-80">
          <div className="flex justify-between gap-4">
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Role</dt>
            <dd>{user.role}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Status</dt>
            <dd>{user.status}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Email verified</dt>
            <dd>{user.isEmailVerified ? "Yes" : "No"}</dd>
          </div>
        </dl>

        {error ? (
          <div className="mt-4">
            <Alert>{error}</Alert>
          </div>
        ) : null}

        <div className="mt-6 space-y-3">
          <Link href="/sessions">
            <Button type="button" variant="ghost">
              <DevicesIcon size={18} aria-hidden />
              Manage sessions
            </Button>
          </Link>
          <Button type="button" onClick={onLogout} disabled={loggingOut}>
            {loggingOut ? (
              <SpinnerIcon size={18} className="animate-spin" aria-hidden />
            ) : (
              <SignOutIcon size={18} aria-hidden />
            )}
            {loggingOut ? "Signing out…" : "Sign out"}
          </Button>
        </div>
      </SurfaceCard>
    </main>
  );
}
