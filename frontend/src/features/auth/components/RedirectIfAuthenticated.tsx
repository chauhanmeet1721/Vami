"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/features/auth/providers/AuthProvider";
import { SpinnerIcon } from "@/shared/icons";

export function RedirectIfAuthenticated({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <main className="flex flex-1 items-center justify-center gap-2 p-6 text-sm opacity-70">
        <SpinnerIcon size={18} className="animate-spin" aria-hidden />
        Loading…
      </main>
    );
  }

  if (status === "authenticated") {
    return null;
  }

  return children;
}
