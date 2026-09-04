'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { MailCheck } from 'lucide-react';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../schemas/auth.schemas';
import { useForgotPasswordMutation } from '../hooks/useForgotPasswordMutation';
import { Button } from '@/components/atomic/atoms/button';
import { FormField } from '@/components/atomic/molecules/form-field';
import { Stack } from '@/components/atomic/layout/stack';
import { Flex } from '@/components/atomic/layout/flex';
import { Box } from '@/components/atomic/layout/box';
import { Typography } from '@/components/atomic/atoms/typography';
import type { ApiError } from '@/core/api-client';

export function ForgotPasswordForm() {
  const [submittedEmail, setSubmittedEmail] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onTouched',
    defaultValues: { email: '' },
  });

  const { mutateAsync: forgotPassword, isPending } = useForgotPasswordMutation();
  const isLoading = isSubmitting || isPending;

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPassword(data.email);
      setSubmittedEmail(data.email);
      toast.success('Reset instructions dispatched');
    } catch (err: unknown) {
      const error = err as ApiError;
      toast.error(error.message || 'Unable to process request. Please try again later.');
    }
  };

  // ─── Success Confirmation Screen ───────────────────────────────────────────
  if (submittedEmail) {
    return (
      <Stack gap={6} align="center" className="text-center select-none">
        <Flex align="center" justify="center" className="mx-auto w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          <MailCheck className="h-8 w-8 stroke-[1.75]" />
        </Flex>

        <Stack gap={2}>
          <Typography variant="h3">
            Check your inbox
          </Typography>
          <Typography variant="p" className="max-w-70 mx-auto">
            If an account matches{' '}
            <Typography variant="span" className="font-bold text-zinc-800 dark:text-zinc-200">{submittedEmail}</Typography>
            {', '}we have dispatched a password reset link.
          </Typography>
        </Stack>

        <Stack gap={3} className="pt-2 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={() => setSubmittedEmail(null)}
            className="w-full h-12 rounded-2xl text-[14px] font-semibold tracking-wide uppercase border-zinc-300 dark:border-zinc-700"
          >
            Try another email
          </Button>

          <Button asChild variant="brandLink" className="h-auto p-0 text-[13px] font-semibold tracking-wider uppercase flex items-center justify-center gap-1 group">
            <Link href="/login">
              <Typography variant="span">Back to sign in</Typography>
              <Typography variant="span" className="transition-transform duration-150 group-hover:translate-x-0.5">&gt;</Typography>
            </Link>
          </Button>
        </Stack>
      </Stack>
    );
  }

  // ─── Request Form ──────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack gap={5} className="select-none">
        <FormField
          id="forgot-email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          isRequired
          disabled={isLoading}
          errorMessage={errors.email?.message}
          className="h-12 rounded-xl text-[15px]"
          {...register('email')}
        />

        <Box className="pt-2">
          <Button type="submit" variant="brand" size="brand" className="w-full" disabled={isLoading} isLoading={isLoading}>
            {isLoading ? 'Sending link...' : 'Send Reset Link'}
          </Button>
        </Box>

        <Flex direction="col" align="center" className="pt-3 text-center">
          <Button asChild variant="brandLink" className="h-auto p-0 flex items-center gap-1.5 group">
            <Link href="/login">
              <Typography variant="span">Return to sign in</Typography>
              <Typography variant="span" className="transition-transform duration-150 group-hover:translate-x-1">&gt;</Typography>
            </Link>
          </Button>
        </Flex>
      </Stack>
    </form>
  );
}
