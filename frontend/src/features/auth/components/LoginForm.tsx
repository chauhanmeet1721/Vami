"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginDto } from "@vami/schemas";
import { authApi } from "@/features/auth/api/auth.api";
import {
  applyFieldErrors,
  getAuthErrorMessage,
} from "@/features/auth/lib/error-message";
import { useAuth } from "@/features/auth/providers/AuthProvider";
import { ApiError } from "@/platform/api";
import { SpinnerIcon } from "@/shared/icons";
import { Alert, Button, FormField, TextInput, SurfaceCard } from "@/shared/ui";

export function LoginForm() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setShowResend(false);
    setResendMessage(null);
    try {
      const data = await authApi.login(values);
      setSession(data.accessToken, data.user, data.session._id);
      router.replace("/");
    } catch (error) {
      applyFieldErrors(error, setError);
      if (error instanceof ApiError && error.isForbidden) {
        setShowResend(true);
      }
      setFormError(getAuthErrorMessage(error, "Unable to sign in."));
    }
  });

  const onResend = async () => {
    const email = getValues("email");
    setResendMessage(null);
    try {
      await authApi.resendVerification({ email });
      setResendMessage("If that account needs verification, a new email was sent.");
    } catch (error) {
      setResendMessage(getAuthErrorMessage(error, "Could not resend verification."));
    }
  };

  return (
    <SurfaceCard
      title="Sign in"
      description="Use your Vami account credentials."
      footer={
        <>
          <Link className="underline-offset-2 hover:underline" href="/register">
            Create an account
          </Link>
          {" · "}
          <Link
            className="underline-offset-2 hover:underline"
            href="/forgot-password"
          >
            Forgot password
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <TextInput
            id="email"
            type="email"
            autoComplete="email"
            disabled={isSubmitting}
            {...register("email")}
          />
        </FormField>
        <FormField
          label="Password"
          htmlFor="password"
          error={errors.password?.message}
        >
          <TextInput
            id="password"
            type="password"
            autoComplete="current-password"
            disabled={isSubmitting}
            {...register("password")}
          />
        </FormField>

        {formError ? <Alert>{formError}</Alert> : null}
        {resendMessage ? <Alert tone="info">{resendMessage}</Alert> : null}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <SpinnerIcon size={18} className="animate-spin" aria-hidden />
          ) : null}
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>

        {showResend ? (
          <Button type="button" variant="ghost" onClick={onResend}>
            Resend verification email
          </Button>
        ) : null}
      </form>
    </SurfaceCard>
  );
}
