"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { passwordSchema } from "@vami/schemas";
import { authApi } from "@/features/auth/api/auth.api";
import {
  applyFieldErrors,
  getAuthErrorMessage,
} from "@/features/auth/lib/error-message";
import { CheckCircleIcon, WarningIcon } from "@/shared/icons";
import { SpinnerIcon } from "@/shared/icons";
import { Alert, Button, FormField, TextInput, SurfaceCard } from "@/shared/ui";

const formSchema = z.object({
  newPassword: passwordSchema,
});

type FormValues = z.infer<typeof formSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { newPassword: "" },
  });

  if (!token) {
    return (
      <SurfaceCard
        title="Invalid reset link"
        description="The reset token is missing from the URL."
        footer={
          <Link className="underline-offset-2 hover:underline" href="/forgot-password">
            Request a new link
          </Link>
        }
      >
        <div className="mb-4 flex justify-center text-red-500">
          <WarningIcon size={40} weight="duotone" aria-hidden />
        </div>
        <Alert>
          Open the link from your email, or request a new password reset.
        </Alert>
      </SurfaceCard>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await authApi.resetPassword({ token, newPassword: values.newPassword });
      setDone(true);
    } catch (error) {
      applyFieldErrors(error, setError);
      setFormError(getAuthErrorMessage(error, "Unable to reset password."));
    }
  });

  if (done) {
    return (
      <SurfaceCard
        title="Password updated"
        description="All existing sessions were revoked by the server."
        footer={
          <Link className="underline-offset-2 hover:underline" href="/login">
            Sign in
          </Link>
        }
      >
        <div className="mb-4 flex justify-center text-emerald-600">
          <CheckCircleIcon size={40} weight="duotone" aria-hidden />
        </div>
        <Button type="button" onClick={() => router.replace("/login")}>
          Continue to sign in
        </Button>
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard title="Choose a new password" description="Enter a strong password.">
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <FormField
          label="New password"
          htmlFor="newPassword"
          error={errors.newPassword?.message}
        >
          <TextInput
            id="newPassword"
            type="password"
            autoComplete="new-password"
            disabled={isSubmitting}
            {...register("newPassword")}
          />
        </FormField>
        {formError ? <Alert>{formError}</Alert> : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <SpinnerIcon size={18} className="animate-spin" aria-hidden />
          ) : null}
          {isSubmitting ? "Saving…" : "Reset password"}
        </Button>
      </form>
    </SurfaceCard>
  );
}
