import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const containerVariants = cva('mx-auto w-full px-4 sm:px-6 lg:px-8', {
  variants: {
    size: {
      sm: 'max-w-3xl',
      md: 'max-w-5xl',
      lg: 'max-w-7xl',
      xl: 'max-w-[96rem]',
      full: 'max-w-full',
    },
  },
  defaultVariants: {
    size: 'lg',
  },
});

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof containerVariants> {
  as?: React.ElementType;
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, as: Component = 'div', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(containerVariants({ size, className }))}
        {...props}
      />
    );
  }
);
Container.displayName = 'Container';
