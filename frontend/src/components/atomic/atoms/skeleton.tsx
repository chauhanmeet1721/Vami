import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Skeleton — loading placeholder atom.
 *
 * Renders a pulsing grey block that acts as a visual stand-in while
 * content is loading. Pass a className to control width, height, and
 * border-radius.
 *
 * Usage:
 *   <Skeleton className="h-4 w-[200px]" />
 *   <Skeleton className="h-12 w-12 rounded-full" />
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-surface-elevated', className)}
      {...props}
    />
  );
}

export { Skeleton };
