import { RedirectIfAuthenticated, RegisterForm } from "@/features/auth";

export default function RegisterPage() {
  return (
    <RedirectIfAuthenticated>
      <RegisterForm />
    </RedirectIfAuthenticated>
  );
}
