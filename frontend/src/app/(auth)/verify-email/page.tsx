import { Suspense } from "react";
import { VerifyEmailPanel } from "@/features/auth";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<p className="text-sm opacity-70">Loading…</p>}>
      <VerifyEmailPanel />
    </Suspense>
  );
}
