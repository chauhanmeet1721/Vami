"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { authApi } from "@/features/auth/api/auth.api";
import { getAuthErrorMessage } from "@/features/auth/lib/error-message";
import { CheckCircleIcon, SpinnerIcon, WarningIcon } from "@/shared/icons";
import { Alert, Button, SurfaceCard } from "@/shared/ui";

type Phase = "idle" | "loading" | "success" | "error";

export function VerifyEmailPanel() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [phase, setPhase] = useState<Phase>(token ? "loading" : "error");
  const [message, setMessage] = useState(
    token ? "Verifying your email…" : "Verification token is missing from the URL.",
  );

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    (async () => {
      try {
        await authApi.verifyEmail({ token });
        if (!cancelled) {
          setPhase("success");
          setMessage("Email verified successfully. You can sign in now.");
        }
      } catch (error) {
        if (!cancelled) {
          setPhase("error");
          setMessage(getAuthErrorMessage(error, "Verification failed."));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <SurfaceCard
      title="Email verification"
      description="Confirming the token from your email link."
      footer={
        <Link className="underline-offset-2 hover:underline" href="/login">
          Go to sign in
        </Link>
      }
    >
      <div className="mb-4 flex justify-center">
        {phase === "loading" ? (
          <SpinnerIcon size={40} className="animate-spin opacity-70" aria-hidden />
        ) : null}
        {phase === "success" ? (
          <CheckCircleIcon size={40} weight="duotone" className="text-emerald-600" aria-hidden />
        ) : null}
        {phase === "error" ? (
          <WarningIcon size={40} weight="duotone" className="text-red-500" aria-hidden />
        ) : null}
      </div>
      <Alert
        tone={phase === "success" ? "success" : phase === "error" ? "error" : "info"}
      >
        {message}
      </Alert>
      {phase === "success" ? (
        <div className="mt-4">
          <Link href="/login">
            <Button type="button">Sign in</Button>
          </Link>
        </div>
      ) : null}
    </SurfaceCard>
  );
}
