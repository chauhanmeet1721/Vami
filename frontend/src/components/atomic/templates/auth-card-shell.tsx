'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../atoms/button';
import { Box } from '../layout/box';
import { Flex } from '../layout/flex';
import { Typography } from '../atoms/typography';

export interface AuthCardShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function AuthCardShell({
  title,
  subtitle,
  children,
  icon,
  className,
}: AuthCardShellProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const timeout = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  return (
    <Box className="relative min-h-screen w-full select-none flex flex-col justify-center">
      {/* ─── Floating Theme Toggle ────────────────────────────────────────────── */}
      {mounted && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className={cn(
            'fixed top-5 right-5 sm:top-7 sm:right-7 z-50',
            'h-10 w-10 sm:h-11 sm:w-11 rounded-full',
            'bg-white/85 dark:bg-vami-dark-elevated/85 backdrop-blur-md',
            'border border-vami-light-border dark:border-vami-dark-border',
            'text-zinc-600 dark:text-amber-400 shadow-sm hover:shadow-md',
            'transition-all duration-200 hover:scale-105 active:scale-95'
          )}
        >
          {isDark ? (
            <Sun className="h-5 w-5 text-amber-400 transition-transform rotate-0 scale-100" />
          ) : (
            <Moon className="h-5 w-5 text-zinc-700 transition-transform rotate-0 scale-100" />
          )}
        </Button>
      )}

      {/* ─── Centering Container ──────────────────────────────────────────────── */}
      <Flex
        align="center"
        justify="center"
        className="relative z-10 h-full w-full p-4 sm:p-6 overflow-y-auto overflow-x-hidden no-scrollbar"
      >
        <Box
          className={cn(
            'my-auto w-full max-w-105',
            'bg-white dark:bg-vami-dark-surface',
            'rounded-[28px] sm:rounded-4xl p-7 sm:p-9',
            'shadow-[0_16px_48px_rgba(0,0,0,0.1)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.55)]',
            'border border-vami-light-border dark:border-vami-dark-border',
            'transition-all duration-300',
            className
          )}
        >
          {/* Vami Circular Brand Badge */}
          <Flex direction="col" align="center" className="text-center">
            <Flex
              align="center"
              justify="center"
              className={cn(
                'h-20 w-20 sm:h-22 sm:w-22 rounded-full',
                'bg-linear-to-b from-vami-blue to-vami-blue-active text-white',
                'shadow-[0_8px_24px_rgba(51,144,236,0.35)] ring-4 ring-white dark:ring-vami-dark-surface',
                'transition-transform duration-300 hover:scale-105'
              )}
            >
              {icon || <Send className="h-10 w-10 -translate-x-0.5 translate-y-0.5 fill-white stroke-none" />}
            </Flex>

            <Typography variant="h1" className="mt-5 text-2xl sm:text-[25px]">
              {title}
            </Typography>

            {subtitle && (
              <Typography variant="p" className="mt-1.5 text-[14px] text-vami-muted dark:text-vami-muted-dark max-w-[320px] leading-relaxed">
                {subtitle}
              </Typography>
            )}
          </Flex>

          {/* Form Body */}
          <Box className="mt-6 select-text">{children}</Box>
        </Box>
      </Flex>
    </Box>
  );
}
