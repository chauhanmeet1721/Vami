import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, hasError = false, disabled, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        disabled={disabled}
        aria-invalid={hasError ? true : props['aria-invalid']}
        className={cn(
          'flex h-11 sm:h-12 w-full rounded-xl sm:rounded-2xl border-[1.5px] px-4 text-[15px] transition-all duration-200',
          'bg-white dark:bg-vami-dark-input text-zinc-900 dark:text-white',
          'placeholder:text-vami-placeholder dark:placeholder:text-vami-placeholder-dark',
          'focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          hasError
            ? 'border-vami-error focus-visible:border-vami-error focus-visible:ring-1 focus-visible:ring-vami-error'
            : 'border-vami-light-border dark:border-vami-dark-border-input focus-visible:border-vami-blue focus-visible:ring-1 focus-visible:ring-vami-blue',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
