'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Stack } from '@/components/atomic/layout/stack';
import { Flex } from '@/components/atomic/layout/flex';
import { Box } from '@/components/atomic/layout/box';
import { Typography } from '@/components/atomic/atoms/typography';

export interface PasswordStrengthMeterProps {
  password?: string;
  className?: string;
}

export function PasswordStrengthMeter({ password = '', className }: PasswordStrengthMeterProps) {
  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
  ];

  const metCount = requirements.filter((r) => r.met).length;

  const strengthColor =
    metCount === 0
      ? 'bg-zinc-200 dark:bg-zinc-800'
      : metCount === 1
        ? 'bg-red-500'
        : metCount === 2
          ? 'bg-amber-500'
          : 'bg-emerald-500';

  const strengthLabel =
    metCount === 0 ? '' : metCount === 1 ? 'Weak' : metCount === 2 ? 'Fair' : 'Strong';

  if (!password) {
    return null;
  }

  return (
    <Stack gap={3} className={cn('pt-1 select-none', className)}>
      {/* Visual Strength Progress Bar */}
      <Flex gap={2} align="center" role="progressbar" aria-valuenow={metCount} aria-valuemin={0} aria-valuemax={3}>
        {[1, 2, 3].map((step) => (
          <Box
            key={step}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all duration-300',
              step <= metCount ? strengthColor : 'bg-zinc-100 dark:bg-zinc-800'
            )}
          />
        ))}
      </Flex>

      {strengthLabel && (
        <Flex justify="between" align="center" className="text-xs">
          <Typography variant="muted" className="text-xs">Strength</Typography>
          <Typography
            as="span"
            className={cn(
              'font-semibold',
              metCount === 1 && 'text-red-500',
              metCount === 2 && 'text-amber-500',
              metCount === 3 && 'text-emerald-500'
            )}
          >
            {strengthLabel}
          </Typography>
        </Flex>
      )}

      {/* Dynamic Requirements Checklist */}
      <Stack as="ul" gap={1} className="text-xs">
        {requirements.map((req, i) => (
          <Flex
            as="li"
            key={i}
            align="center"
            gap={2}
            className={cn(
              'transition-colors duration-200',
              req.met ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500'
            )}
          >
            {req.met ? (
              <Check className="h-3 w-3 stroke-[2.5]" aria-hidden="true" />
            ) : (
              <Box className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-600 mx-1" aria-hidden="true" />
            )}
            <Typography as="span" className="text-xs">{req.label}</Typography>
          </Flex>
        ))}
      </Stack>
    </Stack>
  );
}
