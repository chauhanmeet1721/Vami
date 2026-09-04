'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { registerSchema, type RegisterFormData } from '../schemas/auth.schemas';
import { useRegisterMutation } from '../hooks/useRegisterMutation';
import { Button } from '@/components/atomic/atoms/button';
import { FormField } from '@/components/atomic/molecules/form-field';
import { PasswordInput } from '@/components/atomic/molecules/password-input';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import type { ApiError } from '@/core/api-client';

import { Stack } from '@/components/atomic/layout/stack';
import { Flex } from '@/components/atomic/layout/flex';
import { Typography } from '@/components/atomic/atoms/typography';

export function RegisterForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const { mutateAsync: registerUser, isPending } = useRegisterMutation();
  const passwordValue = useWatch({ control, name: 'password' }) || '';
  const isLoading = isSubmitting || isPending;

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        username: data.username || undefined,
      });
      toast.success('Account created successfully');
      router.push('/');
    } catch (err: unknown) {
      const error = err as ApiError;
      if (error.status === 409) {
        setError('email', { message: 'An account with this email already exists' });
        toast.error('Email is already registered. Please sign in instead.');
      } else if (error.status === 422 && error.details && typeof error.details === 'object') {
        const details = error.details as Record<string, string[]>;
        Object.entries(details).forEach(([field, messages]) => {
          if (messages?.[0]) {
            setError(field as keyof RegisterFormData, { message: messages[0] });
          }
        });
      } else {
        toast.error(error.message || 'Failed to create account. Please try again.');
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
        {/* ─── Full Name ───────────────────────────────────────────────────── */}
        <FormField
          id="register-name"
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="John Doe"
          isRequired
          disabled={isLoading}
          errorMessage={errors.name?.message}
          className="h-11 rounded-xl text-sm"
          {...register('name')}
        />

        {/* ─── Username (Optional) ─────────────────────────────────────────── */}
        <FormField
          id="register-username"
          label="Username"
          type="text"
          autoComplete="username"
          placeholder="john_doe"
          disabled={isLoading}
          errorMessage={errors.username?.message}
          className="h-11 rounded-xl text-sm"
          labelSuffix={
            <Typography variant="muted" className="text-[12px]">Optional</Typography>
          }
          {...register('username')}
        />

        {/* ─── Email ───────────────────────────────────────────────────────── */}
        <FormField
          id="register-email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          isRequired
          disabled={isLoading}
          errorMessage={errors.email?.message}
          className="h-11 rounded-xl text-sm"
          {...register('email')}
        />

        {/* ─── Password ────────────────────────────────────────────────────── */}
        <FormField
          label="Password"
          isRequired
          errorMessage={errors.password?.message}
          inputSuffix={<PasswordStrengthMeter password={passwordValue} />}
        >
          <PasswordInput
            id="register-password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            disabled={isLoading}
            hasError={Boolean(errors.password)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'register-password-error' : undefined}
            className="h-11 rounded-xl text-sm"
            {...register('password')}
          />
        </FormField>

        {/* ─── Confirm Password ────────────────────────────────────────────── */}
        <FormField
          label="Confirm password"
          isRequired
          errorMessage={errors.confirmPassword?.message}
        >
          <PasswordInput
            id="register-confirm-password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            disabled={isLoading}
            hasError={Boolean(errors.confirmPassword)}
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={errors.confirmPassword ? 'register-confirm-password-error' : undefined}
            className="h-11 rounded-xl text-sm"
            {...register('confirmPassword')}
          />
        </FormField>

        {/* ─── Submit ──────────────────────────────────────────────────────── */}
        <Flex className="pt-2">
          <Button type="submit" variant="brand" size="brand" className="w-full" disabled={isLoading} isLoading={isLoading}>
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </Flex>

        {/* ─── Links ───────────────────────────────────────────────────────── */}
        <Stack align="center" gap={2} className="pt-3 text-center">
          <Button asChild variant="brandLink" className="h-auto p-0 flex items-center gap-1.5 group">
            <Link href="/login">
              <Typography variant="span">Already have an account? Sign in</Typography>
              <Typography variant="span" className="transition-transform duration-150 group-hover:translate-x-1">&gt;</Typography>
            </Link>
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
