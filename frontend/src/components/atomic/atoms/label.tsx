import * as React from 'react';
import { cn } from '@/lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  isRequired?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, isRequired, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'text-sm font-medium leading-none text-zinc-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-zinc-100',
          className
        )}
        {...props}
      >
        {children}
        {isRequired && (
          <span className="ml-1 text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </label>
    );
  }
);

Label.displayName = 'Label';
