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
    <Flex direction="col" className="min-h-screen bg-background text-foreground antialiased">
      <Header title={headerTitle} />
      <Box as="main" className={cn('flex-1', className)}>
        <Container className="py-8">
          {children}
        </Container>
      </Box>
      <Box as="footer" className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        <Typography variant="p" className="text-xs">
          © {new Date().getFullYear()} Vami Architecture. Clean Architecture & Atomic Design.
        </Typography>
      </Box>
    </Flex>
  );
};
