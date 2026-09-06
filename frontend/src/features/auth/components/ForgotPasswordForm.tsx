"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordDto } from "@vami/schemas";
import { authApi } from "@/features/auth/api/auth.api";
import {
  applyFieldErrors,
  getAuthErrorMessage,
} from "@/features/auth/lib/error-message";
import { EnvelopeIcon } from "@/shared/icons";
import { SpinnerIcon } from "@/shared/icons";
import { Alert, Button, FormField, TextInput, SurfaceCard } from "@/shared/ui";

export function ForgotPasswordForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordDto>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await authApi.forgotPassword(values);
      setDone(true);
    } catch (error) {
      applyFieldErrors(error, setError);
      setFormError(getAuthErrorMessage(error, "Unable to start password reset."));
    }
  });

  if (done) {
    return (
      <SurfaceCard
        title="Check your email"
        description="If an account exists for that address, a reset link was sent."
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
          Follow the link in the email to choose a new password.
        </Alert>
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard
      title="Forgot password"
      description="We will email a reset link if the account exists."
      footer={
        <Link className="underline-offset-2 hover:underline" href="/login">
          Back to sign in
        </Link>
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
        {formError ? <Alert>{formError}</Alert> : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <SpinnerIcon size={18} className="animate-spin" aria-hidden />
          ) : null}
          {isSubmitting ? "Sending…" : "Send reset link"}
        </Button>
      </form>
    </SurfaceCard>
  );
}
