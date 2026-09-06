import { ForgotPasswordForm, RedirectIfAuthenticated } from "@/features/auth";

export default function ForgotPasswordPage() {
  return (
    <RedirectIfAuthenticated>
      <ForgotPasswordForm />
    </RedirectIfAuthenticated>
  );
}
