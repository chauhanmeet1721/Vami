'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import { resetPasswordSchema, type ResetPasswordFormData } from '../schemas/auth.schemas';
import { useResetPasswordMutation } from '../hooks/useResetPasswordMutation';
import { Button } from '@/components/atomic/atoms/button';
import { FormField } from '@/components/atomic/molecules/form-field';
import { PasswordInput } from '@/components/atomic/molecules/password-input';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { Stack } from '@/components/atomic/layout/stack';
import { Flex } from '@/components/atomic/layout/flex';
import { Box } from '@/components/atomic/layout/box';
import { Typography } from '@/components/atomic/atoms/typography';
import type { ApiError } from '@/core/api-client';

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token') ?? '';

  const [token, setToken] = React.useState(tokenFromUrl);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onTouched',
    defaultValues: { password: '', confirmPassword: '' },
  });

  const { mutateAsync: resetPassword, isPending } = useResetPasswordMutation();
  const passwordValue = useWatch({ control, name: 'password' }) || '';
  const isLoading = isSubmitting || isPending;

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token.trim()) {
      toast.error('Reset token is missing or invalid');
      return;
    }
    try {
      await resetPassword({ token: token.trim(), newPassword: data.password });
      setIsSuccess(true);
      toast.success('Password updated successfully');
    } catch (err: unknown) {
      const error = err as ApiError;
      toast.error(error.message || 'Failed to reset password. The link may have expired.');
    }
  };

  // ─── Success State ─────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <Stack gap={6} align="center" className="text-center select-none">
        <Flex align="center" justify="center" className="mx-auto w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="h-8 w-8 stroke-[1.75]" />
        </Flex>

        <Stack gap={2}>
          <Typography variant="h3">
            Password reset complete
          </Typography>
          <Typography variant="p">
            Your password has been updated successfully.
          </Typography>
        </Stack>

        <Box className="pt-2 w-full">
          <Button asChild variant="brand" size="brand" className="w-full">
            <Link href="/login">Sign In Now</Link>
          </Button>
        </Box>
      </Stack>
    );
  }

  // ─── Reset Form ────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack gap={4} className="select-none">
        {/* ─── Token (only shown when not present in URL) ───────────────────── */}
        {!tokenFromUrl && (
          <FormField
            id="reset-token"
            label="Reset Token"
            type="text"
            placeholder="Paste your reset token"
            isRequired
            value={token}
            onChange={(e) => setToken(e.target.value)}
            disabled={isLoading}
            className="h-11 rounded-xl text-sm"
          />
        )}

        {/* ─── New Password ────────────────────────────────────────────────── */}
        <FormField
          label="New Password"
          isRequired
          errorMessage={errors.password?.message}
          inputSuffix={<PasswordStrengthMeter password={passwordValue} />}
        >
          <PasswordInput
            id="reset-password"
            autoComplete="new-password"
            placeholder="Enter new password"
            disabled={isLoading}
            hasError={Boolean(errors.password)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'reset-password-error' : undefined}
            className="h-11 rounded-xl text-sm"
            {...register('password')}
          />
        </FormField>

        {/* ─── Confirm Password ────────────────────────────────────────────── */}
        <FormField
          label="Confirm New Password"
          isRequired
          errorMessage={errors.confirmPassword?.message}
        >
          <PasswordInput
            id="reset-confirm-password"
            autoComplete="new-password"
            placeholder="Repeat new password"
            disabled={isLoading}
            hasError={Boolean(errors.confirmPassword)}
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={errors.confirmPassword ? 'reset-confirm-password-error' : undefined}
            className="h-11 rounded-xl text-sm"
            {...register('confirmPassword')}
          />
        </FormField>

        {/* ─── Submit ──────────────────────────────────────────────────────── */}
        <Box className="pt-2">
          <Button type="submit" variant="brand" size="brand" className="w-full" disabled={isLoading} isLoading={isLoading}>
            {isLoading ? 'Updating...' : 'Set New Password'}
          </Button>
        </Box>

        {/* ─── Links ───────────────────────────────────────────────────────── */}
        <Flex direction="col" align="center" className="pt-3 text-center">
          <Button asChild variant="brandLink" className="h-auto p-0 flex items-center gap-1.5 group">
            <Link href="/login">
              <Typography variant="span">Cancel and return to sign in</Typography>
              <Typography variant="span" className="transition-transform duration-150 group-hover:translate-x-1">&gt;</Typography>
            </Link>
          </Button>
        </Flex>
      </Stack>
    </form>
  );
}
