'use client';

import React from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { Button } from '../atoms/button';
import { Flex } from '../layout/flex';
import { Stack } from '../layout/stack';
import { Typography } from '../atoms/typography';

function FeatureErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <Flex direction="col" align="center" justify="center" className="p-8 m-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg text-center h-full min-h-75">
      <Flex align="center" justify="center" className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 mb-4">
        <svg
          className="w-6 h-6 text-red-600 dark:text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </Flex>
      <Stack gap={2} className="mb-6">
        <Typography variant="h2" className="text-lg">
          Something went wrong in this section
        </Typography>
        <Typography variant="p" className="text-zinc-600 dark:text-zinc-400 max-w-md">
          {error instanceof Error ? error.message : 'An unexpected error occurred.'}
        </Typography>
      </Stack>
      <Button onClick={resetErrorBoundary}>
        Try Again
      </Button>
    </Flex>
  );
}

export function FeatureErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={FeatureErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}
