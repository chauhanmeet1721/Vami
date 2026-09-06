"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api/auth.api";
import { getAuthErrorMessage } from "@/features/auth/lib/error-message";
import { useAuth } from "@/features/auth/providers/AuthProvider";
import { ArrowLeftIcon, DevicesIcon, SpinnerIcon } from "@/shared/icons";
import { Alert, Button } from "@/shared/ui";

const SESSIONS_KEY = ["auth", "sessions"] as const;

export function SessionsPanel() {
  const { activeSessionId } = useAuth();
  const queryClient = useQueryClient();

  const sessionsQuery = useQuery({
    queryKey: SESSIONS_KEY,
    queryFn: () => authApi.listSessions(),
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => authApi.revokeSession(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
    },
  });

  const revokeOthersMutation = useMutation({
    mutationFn: () => authApi.revokeOtherSessions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
    },
  });

  if (sessionsQuery.isLoading) {
    return (
      <p className="flex items-center justify-center gap-2 p-6 text-sm opacity-70">
        <SpinnerIcon size={18} className="animate-spin" aria-hidden />
        Loading sessions…
      </p>
    );
  }

  if (sessionsQuery.isError) {
    return (
      <div className="p-6">
        <Alert>
          {getAuthErrorMessage(sessionsQuery.error, "Failed to load sessions.")}
        </Alert>
      </div>
    );
  }

  const sessions = sessionsQuery.data ?? [];

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <DevicesIcon size={28} className="mt-0.5 opacity-80" aria-hidden />
          <div>
            <h1 className="text-xl font-semibold">Active sessions</h1>
            <p className="text-sm opacity-70">
              Manage devices signed into your account.
            </p>
          </div>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm underline-offset-2 hover:underline"
        >
          <ArrowLeftIcon size={16} aria-hidden />
          Home
        </Link>
      </div>

      <Button
        type="button"
        variant="ghost"
        disabled={revokeOthersMutation.isPending || sessions.length <= 1}
        onClick={() => revokeOthersMutation.mutate()}
      >
        {revokeOthersMutation.isPending
          ? "Revoking…"
          : "Revoke all other sessions"}
      </Button>

      {revokeOthersMutation.isError ? (
        <Alert>
          {getAuthErrorMessage(
            revokeOthersMutation.error,
            "Failed to revoke other sessions.",
          )}
        </Alert>
      ) : null}

      <ul className="space-y-3">
        {sessions.map((session) => {
          const isCurrent = session._id === activeSessionId;
          return (
            <li
              key={session._id}
              className="rounded-2xl border p-4 text-sm"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--foreground) 12%, transparent)",
              }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-medium">
                    {session.deviceInfo?.browser || "Unknown browser"}
                    {session.deviceInfo?.os
                      ? ` · ${session.deviceInfo.os}`
                      : ""}
                    {isCurrent ? " · This device" : ""}
                  </p>
                  <p className="opacity-70">IP: {session.ipAddress}</p>
                  <p className="opacity-70">
                    Last active: {new Date(session.lastActiveAt).toLocaleString()}
                  </p>
                </div>
                {!isCurrent ? (
                  <button
                    type="button"
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400"
                    disabled={revokeMutation.isPending}
                    onClick={() => revokeMutation.mutate(session._id)}
                  >
                    Revoke
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
