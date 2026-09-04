import * as React from 'react';
import { Label } from '../atoms/label';
import { Input, InputProps } from '../atoms/input';
import { Stack } from '../layout/stack';
import { Flex } from '../layout/flex';
import { Box } from '../layout/box';
import { Typography } from '../atoms/typography';

export interface FormFieldProps extends Partial<InputProps> {
  /** Field label text */
  label: string;
  /** Optional node rendered to the right of the label (e.g. "Forgot password?" link) */
  labelSuffix?: React.ReactNode;
  /** Helper text shown below the field when there is no error */
  helperText?: string;
  /** Validation error message — shown in red, replaces helperText when set */
  errorMessage?: string;
  /** Marks the label with a required indicator (*) */
  isRequired?: boolean;
  /**
   * Optional slot rendered below the input, before the error/helper text.
   * Use for inline additions like PasswordStrengthMeter or character counters.
   */
  inputSuffix?: React.ReactNode;
  /**
   * When provided, renders children instead of the default <Input>.
   * Use for custom input types like PasswordInput.
   * The children are responsible for their own styling and ref handling.
   */
  children?: React.ReactNode;
  /**
   * className applied to the outer wrapper div.
   * Use this to control field layout (e.g. spacing, width) from the parent.
   *
   * NOTE: `className` (from InputProps) is forwarded to the <Input> element itself.
   * This separates wrapper styling from input styling — they are independent concerns.
   */
  wrapperClassName?: string;
}

/**
 * FormField — the canonical molecule for all form fields.
 *
 * Encapsulates: label, labelSuffix, input (or children), inputSuffix, error/helper text.
 * Handles: id generation, aria-describedby, aria-invalid, hasError state.
 *
 * Usage with react-hook-form:
 *   <FormField
 *     label="Email"
 *     id="login-email"
 *     type="email"
 *     isRequired
 *     errorMessage={errors.email?.message}
 *     {...register('email')}
 *   />
 *
 * Usage with PasswordInput (children slot):
 *   <FormField label="Password" isRequired errorMessage={errors.password?.message}>
 *     <PasswordInput id="..." {...register('password')} />
 *   </FormField>
 *
 * Usage with wrapperClassName:
 *   <FormField label="Name" wrapperClassName="col-span-2" className="rounded-lg" ... />
 *   └── outer div gets "col-span-2", Input gets "rounded-lg"
 */
export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      errorMessage,
      helperText,
      isRequired,
      labelSuffix,
      inputSuffix,
      wrapperClassName,
      id,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const childrenId = React.isValidElement(children) ? (children as React.ReactElement<{ id?: string }>).props.id : undefined;
    const inputId = id || childrenId || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const describedBy = [
      errorMessage ? errorId : undefined,
      helperText ? helperId : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <Stack gap={2} className={wrapperClassName}>
        {/* Label Row */}
        <Flex align="center" justify={labelSuffix ? 'between' : 'start'}>
          <Label htmlFor={inputId} isRequired={isRequired}>
            {label}
          </Label>
          {labelSuffix && <Box>{labelSuffix}</Box>}
        </Flex>

        {/* Input area */}
        {children ? (
          // If children are passed, clone them to inject accessibility props if they are valid React elements
          React.isValidElement(children)
            ? React.cloneElement(children as React.ReactElement<{ id?: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }>, {
                id: (children as React.ReactElement<{ id?: string }>).props.id || inputId,
                'aria-invalid': Boolean(errorMessage) || (children as React.ReactElement<{ 'aria-invalid'?: boolean }>).props['aria-invalid'],
                'aria-describedby': describedBy || (children as React.ReactElement<{ 'aria-describedby'?: string }>).props['aria-describedby'],
              })
            : children
        ) : (
          <Input
            id={inputId}
            ref={ref}
            className={className}
            hasError={Boolean(errorMessage)}
            aria-invalid={Boolean(errorMessage)}
            aria-describedby={describedBy}
            {...props}
          />
        )}
        
        {/* Input Suffix underneath (like Password Strength Meter) */}
        {inputSuffix && <Box>{inputSuffix}</Box>}

        {/* Helper or Error Message */}
        {errorMessage ? (
          <Typography variant="span" id={errorId} className="text-xs text-destructive font-medium">
            {errorMessage}
          </Typography>
        ) : helperText ? (
          <Typography variant="span" id={helperId} className="text-xs text-zinc-500 dark:text-zinc-400">
            {helperText}
          </Typography>
        ) : null}
      </Stack>
    );
  }
);

FormField.displayName = 'FormField';
