import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthCardShell } from '@/components/atomic/templates';
import { Flex } from '@/components/atomic/layout/flex';
import { Box } from '@/components/atomic/layout/box';
import { Typography } from '@/components/atomic/atoms/typography';
import { Button } from '@/components/atomic/atoms/button';
import { CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Verify Email',
  description: 'Verify your email address to activate your Vami account.',
};

async function verifyTokenOnServer(token: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('API URL is not defined');

  const res = await fetch(`${apiUrl}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
    cache: 'no-store', // Always hit the API, don't cache this request
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Verification failed');
  }

  return res.json();
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params?.token;

  // 1. No token -> Unauthorized access, immediately redirect to login
  if (!token) {
    redirect('/login');
  }

  // 2. Token present -> Validate on server
  let isSuccess = false;
  let errorMessage = '';

  try {
    await verifyTokenOnServer(token);
    isSuccess = true;
  } catch (error: unknown) {
    isSuccess = false;
    errorMessage = error instanceof Error ? error.message : 'The verification link is invalid or has expired.';
  }

  return (
    <AuthCardShell
      title={isSuccess ? 'Email Verified' : 'Verification Failed'}
      subtitle={isSuccess ? 'Your account is now fully activated.' : 'We could not verify your email address.'}
    >
      <Flex direction="col" align="center" gap={6} className="text-center select-none py-4">
        {isSuccess ? (
          <>
            <Flex align="center" justify="center" className="mx-auto w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-8 w-8 stroke-[1.75]" />
            </Flex>
            <Typography variant="p" className="text-zinc-500 dark:text-zinc-400 max-w-sm">
              Thank you for verifying your email. You can now access all features of your dashboard.
            </Typography>
            <Box className="pt-2">
              <Button asChild variant="brand" size="brand">
                <Link href="/">Continue to Dashboard</Link>
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Flex align="center" justify="center" className="mx-auto w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
              <XCircle className="h-8 w-8 stroke-[1.75]" />
            </Flex>
            <Typography variant="p" className="text-red-600 dark:text-red-400 max-w-sm">
              {errorMessage}
            </Typography>
            <Box className="pt-2">
              <Button asChild variant="brand" size="brand">
                <Link href="/login">Return to Sign In</Link>
              </Button>
            </Box>
          </>
        )}
      </Flex>
    </AuthCardShell>
  );
}
