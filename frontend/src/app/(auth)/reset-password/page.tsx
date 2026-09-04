import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import { AuthCardShell } from '@/components/atomic/templates';
import { ResetPasswordForm } from '@/features/auth';
import { Flex } from '@/components/atomic/layout/flex';
import { Typography } from '@/components/atomic/atoms/typography';

export const metadata: Metadata = {
  title: 'Set New Password',
  description: 'Choose a new password for your Vami account.',
};

export default function ResetPasswordPage() {
  return (
    <AuthCardShell
      title="Set New Password"
      subtitle="Please choose a strong password to secure your account."
    >
      <Suspense fallback={<Flex align="center" justify="center" className="h-64"><Typography variant="span" className="text-sm text-zinc-400">Loading form...</Typography></Flex>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthCardShell>
  );
}
