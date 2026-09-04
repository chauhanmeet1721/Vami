import * as React from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '../atoms/skeleton';
import { Flex } from '../layout/flex';
import { Stack } from '../layout/stack';

export function AppLoadingScreen() {
  return (
    <Flex
      direction="col"
      align="center"
      justify="center"
      className={cn(
        'fixed inset-0 z-50 gap-6',
        'bg-white dark:bg-vami-dark-bg',
        'transition-colors duration-300'
      )}
      role="status"
      aria-label="Loading your session..."
    >
      {/* Brand badge */}
      <Flex
        align="center"
        justify="center"
        className={cn(
          'h-16 w-16 rounded-full',
          'bg-linear-to-b from-vami-blue to-vami-blue-active text-white',
          'shadow-[0_8px_24px_rgba(51,144,236,0.35)]',
          'animate-pulse'
        )}
      >
        <Send className="h-7 w-7 -translate-x-0.5 translate-y-0.5 fill-white stroke-none" />
      </Flex>

      {/* Skeleton content placeholders */}
      <Stack gap={3} align="center" className="w-48">
        <Skeleton className="h-3 w-full rounded-full" />
        <Skeleton className="h-3 w-4/5 rounded-full" />
        <Skeleton className="h-3 w-3/5 rounded-full" />
      </Stack>
    </Flex>
  );
}
