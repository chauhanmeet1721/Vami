import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked = false, onCheckedChange, disabled, id, label, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked);
    };

    return (
      <label
        htmlFor={inputId}
        className={cn(
          'inline-flex items-center gap-2.5 select-none cursor-pointer text-[14px] text-vami-muted dark:text-vami-muted-dark',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        <div className="relative flex items-center justify-center">
          <input
            id={inputId}
            type="checkbox"
            ref={ref}
            checked={checked}
            disabled={disabled}
            onChange={handleChange}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'h-5 w-5 rounded-md border-[1.5px] transition-all duration-150 flex items-center justify-center',
              'border-vami-light-border bg-white dark:border-vami-dark-border-checkbox dark:bg-vami-dark-input',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-vami-blue/40 peer-focus-visible:ring-offset-1',
              'peer-checked:bg-vami-blue peer-checked:border-vami-blue peer-checked:text-white',
              disabled && 'bg-zinc-100 dark:bg-zinc-800'
            )}
            aria-hidden="true"
          >
            <Check
              className={cn(
                'h-3.5 w-3.5 stroke-3 text-white transition-transform duration-150',
                checked ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              )}
            />
          </div>
        </div>
        {label && <span className="leading-none select-none">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
