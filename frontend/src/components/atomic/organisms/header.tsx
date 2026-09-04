import * as React from 'react';
import Link from 'next/link';
import { Badge } from '../atoms/badge';
import { Button } from '../atoms/button';
import { cn } from '@/lib/utils';
import { Flex } from '../layout/flex';
import { Box } from '../layout/box';
import { Container } from '../layout/container';
import { Typography } from '../atoms/typography';

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Vami Platform',
  className,
  ...props
}) => {
  return (
    <Box
      as="header"
      className={cn(
        'sticky top-0 z-40 w-full border-b border-border bg-surface/80 backdrop-blur-md',
        className
      )}
      {...props}
    >
      <Container className="flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Flex align="center" gap={3}>
          <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <Typography variant="span">{title}</Typography>
          </Link>
          <Badge variant="outline" className="hidden sm:inline-flex text-[11px]">
            Modular Monolith
          </Badge>
        </Flex>

        <Flex as="nav" align="center" gap={3}>
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">
              Log in
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/register">
              Get Started
            </Link>
          </Button>
        </Flex>
      </Container>
    </Box>
  );
};
