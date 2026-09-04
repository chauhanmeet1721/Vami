import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-zinc-900 text-zinc-50 hover:bg-zinc-900/90 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90',
        primary: 'bg-vami-blue text-white hover:bg-vami-blue-hover active:bg-vami-blue-active shadow-[0_4px_16px_rgba(51,144,236,0.3)] hover:shadow-[0_6px_20px_rgba(51,144,236,0.4)]',
        brand: 'bg-vami-blue text-white hover:bg-vami-blue-hover active:bg-vami-blue-active shadow-[0_4px_16px_rgba(51,144,236,0.3)] hover:shadow-[0_6px_20px_rgba(51,144,236,0.4)] uppercase font-semibold tracking-wider text-[14px]',
        brandLink: 'text-vami-blue hover:text-vami-blue-hover dark:text-vami-blue dark:hover:text-vami-blue-link-hover-dark font-semibold uppercase tracking-wider text-[13px]',
        destructive: 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-900 dark:hover:bg-red-800',
        outline: 'border border-zinc-300 bg-transparent hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-50',
        secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700',
        ghost: 'hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50',
        link: 'text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-11 rounded-xl px-8 text-base',
        brand: 'h-12 w-full rounded-2xl px-4 text-[14px] sm:text-[15px]',
        icon: 'h-10 w-10 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, children, disabled, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={cn(buttonVariants({ variant, size, className }))}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
