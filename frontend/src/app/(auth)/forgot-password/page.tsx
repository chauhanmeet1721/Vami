import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import { AuthCardShell } from '@/components/atomic/templates';
import { ForgotPasswordForm } from '@/features/auth';
import { Flex } from '@/components/atomic/layout/flex';
import { Typography } from '@/components/atomic/atoms/typography';

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Request a password reset link for your Vami account.',
};

export default function ForgotPasswordPage() {
  return (
    <AuthCardShell
      title="Reset Password"
      subtitle="Enter your email address to receive recovery instructions."
    >
      <Suspense fallback={<Flex align="center" justify="center" className="h-64"><Typography variant="span" className="text-sm text-zinc-400">Loading form...</Typography></Flex>}>
        <ForgotPasswordForm />
      </Suspense>
    </AuthCardShell>
  );
}
