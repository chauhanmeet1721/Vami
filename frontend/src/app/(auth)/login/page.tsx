import { LoginForm, RedirectIfAuthenticated } from "@/features/auth";

/** Thin server route — composes feature client modules (Master Framework). */
export default function LoginPage() {
  return (
    <RedirectIfAuthenticated>
      <LoginForm />
    </RedirectIfAuthenticated>
  );
}
