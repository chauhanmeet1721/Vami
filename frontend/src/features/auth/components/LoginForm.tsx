'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { loginSchema, type LoginFormData } from '../schemas/auth.schemas';
import { useLoginMutation } from '../hooks/useLoginMutation';
import { Button } from '@/components/atomic/atoms/button';
import { Checkbox } from '@/components/atomic/atoms/checkbox';
import { FormField } from '@/components/atomic/molecules/form-field';
import { PasswordInput } from '@/components/atomic/molecules/password-input';
import { Stack } from '@/components/atomic/layout/stack';
import { Flex } from '@/components/atomic/layout/flex';
import { Typography } from '@/components/atomic/atoms/typography';
import { getSafeRedirectUrl } from '@/lib/security';
import type { ApiError } from '@/core/api-client';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const safeRedirect = getSafeRedirectUrl(searchParams.get('redirect'), '/');

  const [rememberMe, setRememberMe] = React.useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  });

  const { mutateAsync: login, isPending } = useLoginMutation();
  const isLoading = isSubmitting || isPending;

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      toast.success('Signed in successfully');
      router.push(safeRedirect);
    } catch (err: unknown) {
      const error = err as ApiError;
      if (error.status === 422 && error.details && typeof error.details === 'object') {
        const details = error.details as Record<string, string[]>;
        Object.entries(details).forEach(([field, messages]) => {
          if (messages?.[0]) {
            setError(field as keyof LoginFormData, { message: messages[0] });
          }
        });
      } else {
        toast.error(error.message || 'Invalid email or password');
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (validationErrors) => {
        const firstError = Object.values(validationErrors)[0];
        if (firstError?.message) toast.error(String(firstError.message));
      })}
      noValidate
    >
      <Stack gap={4} className="select-none">
        {/* ─── Email ───────────────────────────────────────────────────────── */}
        <FormField
          id="login-email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          isRequired
          disabled={isLoading}
          errorMessage={errors.email?.message}
          className="h-11 sm:h-12 rounded-xl text-[15px]"
          {...register('email')}
        />

        {/* ─── Password ────────────────────────────────────────────────────── */}
        <FormField
          label="Password"
          isRequired
          errorMessage={errors.password?.message}
          labelSuffix={
            <Button asChild variant="link" size="sm" className="h-auto p-0 text-[13px] text-vami-blue hover:text-vami-blue-hover dark:text-vami-blue dark:hover:text-vami-blue-link-hover-dark font-medium transition-colors">
              <Link href="/forgot-password">Forgot password?</Link>
            </Button>
          }
        >
          <PasswordInput
            id="login-password"
            autoComplete="current-password"
            placeholder="Enter your password"
            disabled={isLoading}
            hasError={Boolean(errors.password)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
            className="h-11 sm:h-12 rounded-xl text-[15px]"
            {...register('password')}
          />
        </FormField>

        {/* ─── Remember Me ─────────────────────────────────────────────────── */}
        <Flex className="pt-0.5">
          <Checkbox
            id="remember-me"
            checked={rememberMe}
            onCheckedChange={setRememberMe}
            disabled={isLoading}
            label={<Typography variant="muted" className="text-[13px]">Keep me signed in</Typography>}
          />
        </Flex>

        {/* ─── Submit ──────────────────────────────────────────────────────── */}
        <Flex className="pt-2">
          <Button type="submit" variant="brand" size="brand" className="w-full" disabled={isLoading} isLoading={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Flex>

        {/* ─── Links ───────────────────────────────────────────────────────── */}
        <Stack align="center" gap={2} className="pt-3 text-center">
          <Button asChild variant="brandLink" className="h-auto p-0 flex items-center gap-1.5 group">
            <Link href="/register">
              <Typography variant="span">Create an account</Typography>
              <Typography variant="span" className="transition-transform duration-150 group-hover:translate-x-1">&gt;</Typography>
            </Link>
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
