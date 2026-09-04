import * as React from 'react';
import { cn } from '@/lib/utils';
import { Flex, type FlexProps } from './flex';

export type StackProps = Omit<FlexProps, 'direction'>;

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, ...props }, ref) => {
    return <Flex ref={ref} direction="col" className={cn(className)} {...props} />;
  }
);
Stack.displayName = 'Stack';
