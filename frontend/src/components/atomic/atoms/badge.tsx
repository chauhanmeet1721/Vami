import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900',
        secondary: 'border-transparent bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50',
        success: 'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
        destructive: 'border-transparent bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
        outline: 'text-zinc-950 dark:text-zinc-50 border-zinc-300 dark:border-zinc-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, variant, ...props }: BadgeProps) => {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
};

Badge.displayName = 'Badge';
