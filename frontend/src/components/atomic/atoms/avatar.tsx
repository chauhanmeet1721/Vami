'use client';

/* eslint-disable @next/next/no-img-element */
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

export const avatarVariants = cva(
  'relative inline-flex shrink-0 items-center justify-center rounded-full select-none overflow-hidden bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-[10px]',
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
        xl: 'h-16 w-16 text-xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export const statusDotVariants = cva(
  'absolute bottom-0 right-0 rounded-full ring-2 ring-white dark:ring-zinc-950',
  {
    variants: {
      status: {
        online: 'bg-emerald-500',
        offline: 'bg-zinc-400',
        busy: 'bg-red-500',
        away: 'bg-amber-500',
      },
      size: {
        xs: 'h-1.5 w-1.5',
        sm: 'h-2 w-2',
        md: 'h-2.5 w-2.5',
        lg: 'h-3 w-3',
        xl: 'h-4 w-4',
      },
    },
    defaultVariants: {
      status: 'offline',
      size: 'md',
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof avatarVariants> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = 'md', src, alt = '', fallback, status, ...props }, ref) => {
    const [hasError, setHasError] = React.useState(false);

    const getInitials = (text?: string) => {
      if (!text) return null;
      const parts = text.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return text.slice(0, 2).toUpperCase();
    };

    const initials = getInitials(fallback || alt);

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size, className }))}
        role="img"
        aria-label={alt || fallback || 'User avatar'}
        {...props}
      >
        {src && !hasError ? (
          <img
            src={src}
            alt={alt}
            onError={() => setHasError(true)}
            className="h-full w-full object-cover"
          />
        ) : initials ? (
          <span>{initials}</span>
        ) : (
          <User className="h-1/2 w-1/2 stroke-2 opacity-70" aria-hidden="true" />
        )}

        {status && (
          <span
            className={cn(statusDotVariants({ status, size }))}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
