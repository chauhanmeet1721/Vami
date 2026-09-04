import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import { AuthCardShell } from '@/components/atomic/templates';
import { RegisterForm } from '@/features/auth';
import { Flex } from '@/components/atomic/layout/flex';
import { Typography } from '@/components/atomic/atoms/typography';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create a new Vami account to start chatting with your team.',
};

export default function RegisterPage() {
  return (
    <AuthCardShell
      title="Create your Account"
      subtitle="Join Vami to connect and collaborate in real-time."
    >
      <Suspense fallback={<Flex align="center" justify="center" className="h-64"><Typography variant="span" className="text-sm text-zinc-400">Loading form...</Typography></Flex>}>
        <RegisterForm />
      </Suspense>
    </AuthCardShell>
  );
}
