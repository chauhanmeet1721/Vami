import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import { AuthCardShell } from '@/components/atomic/templates';
import { LoginForm } from '@/features/auth';
import { Flex } from '@/components/atomic/layout/flex';
import { Typography } from '@/components/atomic/atoms/typography';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Vami account to start chatting.',
};

export default function LoginPage() {
  return (
    <AuthCardShell
      title="Sign in to Vami"
      subtitle="Please enter your email address and password to continue."
    >
      <Suspense fallback={<Flex align="center" justify="center" className="h-64"><Typography variant="span" className="text-sm text-zinc-400">Loading form...</Typography></Flex>}>
        <LoginForm />
      </Suspense>
    </AuthCardShell>
  );
}
