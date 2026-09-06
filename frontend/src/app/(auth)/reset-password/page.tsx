import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="text-sm opacity-70">Loading reset form…</p>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
