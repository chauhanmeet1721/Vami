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
          'bg-input text-foreground',
          'placeholder:text-vami-placeholder dark:placeholder:text-vami-placeholder-dark',
          'focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          hasError
            ? 'border-destructive focus-visible:border-destructive focus-visible:ring-1 focus-visible:ring-destructive'
            : 'border-border focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
