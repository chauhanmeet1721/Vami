"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterDto } from "@vami/schemas";
import { authApi } from "@/features/auth/api/auth.api";
import {
  applyFieldErrors,
  getAuthErrorMessage,
} from "@/features/auth/lib/error-message";
import { isAuthSuccess } from "@/features/auth/types";
import { useAuth } from "@/features/auth/providers/AuthProvider";
import { EnvelopeIcon } from "@/shared/icons";
import { SpinnerIcon } from "@/shared/icons";
import { Alert, Button, FormField, TextInput, SurfaceCard } from "@/shared/ui";

export function RegisterForm() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingVerification, setPendingVerification] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterDto>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", username: undefined },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const payload: RegisterDto = {
      name: values.name,
      email: values.email,
      password: values.password,
      ...(values.username ? { username: values.username } : {}),
    };

    try {
      const data = await authApi.register(payload);
      if (isAuthSuccess(data)) {
        setSession(data.accessToken, data.user, data.session._id);
        router.replace("/");
        return;
      }
      setPendingVerification(true);
    } catch (error) {
      applyFieldErrors(error, setError);
      setFormError(getAuthErrorMessage(error, "Unable to create account."));
    }
  });

  if (pendingVerification) {
    return (
      <SurfaceCard
        title="Verify your email"
        description="We created your account. Verify your email before signing in."
        footer={
          <Link className="underline-offset-2 hover:underline" href="/login">
            Back to sign in
          </Link>
        }
      >
        <div className="mb-4 flex justify-center text-[var(--toggle-bg)]">
          <EnvelopeIcon size={40} weight="duotone" aria-hidden />
        </div>
        <Alert tone="success">
          Check your inbox for a verification link. In local development without
          Resend, the token is logged in the backend console.
        </Alert>
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard
      title="Create account"
      description="Register with email and password."
      footer={
        <Link className="underline-offset-2 hover:underline" href="/login">
          Already have an account?
        </Link>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <FormField label="Name" htmlFor="name" error={errors.name?.message}>
          <TextInput
            id="name"
            autoComplete="name"
            disabled={isSubmitting}
            {...register("name")}
          />
        </FormField>
        <FormField
          label="Username (optional)"
          htmlFor="username"
          error={errors.username?.message}
        >
          <TextInput
            id="username"
            autoComplete="username"
            disabled={isSubmitting}
            {...register("username", {
              setValueAs: (value: string) =>
                value.trim() === "" ? undefined : value.trim(),
            })}
          />
        </FormField>
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
            autoComplete="new-password"
            disabled={isSubmitting}
            {...register("password")}
          />
        </FormField>

        {formError ? <Alert>{formError}</Alert> : null}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <SpinnerIcon size={18} className="animate-spin" aria-hidden />
          ) : null}
          {isSubmitting ? "Creating…" : "Create account"}
        </Button>
      </form>
    </SurfaceCard>
  );
}
