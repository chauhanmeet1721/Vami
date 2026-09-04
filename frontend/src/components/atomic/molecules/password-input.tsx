import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input, InputProps } from '../atoms/input';
import { Button } from '../atoms/button';
import { cn } from '@/lib/utils';
import { Box } from '../layout/box';

export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  showToggle?: boolean;
  hasError?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showToggle = true, hasError, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const disabled = props.value === '' || props.value === undefined || props.disabled;

    return (
      <Box className="relative w-full">
        <Input
          type={showPassword ? 'text' : 'password'}
          className={cn('pr-10', className)}
          hasError={hasError}
          ref={ref}
          {...props}
        />
        {showToggle && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              'absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent',
              'text-zinc-500 dark:text-zinc-400',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={disabled}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        )}
      </Box>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
