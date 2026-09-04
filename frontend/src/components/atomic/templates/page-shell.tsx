import * as React from 'react';
import { Header } from '../organisms/header';
import { cn } from '@/lib/utils';
import { Flex } from '../layout/flex';
import { Box } from '../layout/box';
import { Container } from '../layout/container';
import { Typography } from '../atoms/typography';

export interface PageShellProps {
  children: React.ReactNode;
  headerTitle?: string;
  className?: string;
}

export const PageShell: React.FC<PageShellProps> = ({
  children,
  headerTitle,
  className,
}) => {
  return (
    <Flex direction="col" className="min-h-screen bg-zinc-50 text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-50">
      <Header title={headerTitle} />
      <Box as="main" className={cn('flex-1', className)}>
        <Container className="py-8">
          {children}
        </Container>
      </Box>
      <Box as="footer" className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <Typography variant="p" className="text-xs">
          © {new Date().getFullYear()} Vami Architecture. Clean Architecture & Atomic Design.
        </Typography>
      </Box>
    </Flex>
  );
};
