'use client';

/**
 * Providers — The application's root provider composition.
 *
 * Architecture:
 * ┌─────────────────────────────────────────────────────┐
 * │ ErrorBoundary      ← catches unrecoverable UI crashes│
 * │  QueryClientProvider ← TanStack Query (server state) │
 * │   AuthProvider      ← auth identity (Context)        │
 * │    {children}       ← the actual application         │
 * └─────────────────────────────────────────────────────┘
 *
 * Sonner's <Toaster /> sits at this level so toasts appear above all content.
 *
 * This file is a 'use client' boundary. The root layout.tsx stays a Server
 * Component and simply renders <Providers>{children}</Providers>.
 */

import React from 'react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/features/auth/providers/AuthProvider';
import { Button } from '@/components/atomic/atoms/button';

/**
 * Global QueryClient configuration.
 * - staleTime: 60s — server data is considered fresh for 1 minute before background refetch
 * - retry: 1 — retry failed requests once before showing an error state
 * - refetchOnWindowFocus: false in dev — prevents noise while coding
 *
 * These settings are sane defaults for a chat app. Individual queries can
 * override these via their own queryOptions.
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
        refetchOnWindowFocus: process.env.NODE_ENV === 'production',
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

// Singleton QueryClient — created once outside the component to survive HMR in dev.
let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always create a new client to avoid sharing data between requests
    return makeQueryClient();
  }
  // Browser: reuse the same client across renders
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

/**
 * Root error fallback shown when the entire React tree crashes.
 * Provides a recovery mechanism via "Try Again" which resets the error boundary.
 */
import { Flex } from '@/components/atomic/layout/flex';
import { Typography } from '@/components/atomic/atoms/typography';

function RootErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const message =
    process.env.NODE_ENV === 'development' && error instanceof Error
      ? error.message
      : 'An unexpected error occurred. Please try again.';

  return (
    <Flex direction="col" align="center" justify="center" gap={4} className="min-h-screen p-8 text-center">
      <Typography variant="h1" className="text-2xl">
        Something went wrong
      </Typography>
      <Typography variant="p" className="max-w-md text-sm text-zinc-500">
        {message}
      </Typography>
      <Button onClick={resetErrorBoundary}>
        Try Again
      </Button>
    </Flex>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <ErrorBoundary FallbackComponent={RootErrorFallback}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {children}
            {/* Sonner Toaster — renders above all content, below ErrorBoundary */}
            <Toaster
              position="top-right"
              richColors
              closeButton
              duration={4000}
            />
          </AuthProvider>
          {/* DevTools only rendered in development; tree-shaken in production builds */}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </QueryClientProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
