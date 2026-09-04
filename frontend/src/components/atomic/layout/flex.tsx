import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const flexVariants = cva('flex', {
  variants: {
    direction: {
      row: 'flex-row',
      col: 'flex-col',
      rowReverse: 'flex-row-reverse',
      colReverse: 'flex-col-reverse',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
    },
    wrap: {
      nowrap: 'flex-nowrap',
      wrap: 'flex-wrap',
      wrapReverse: 'flex-wrap-reverse',
    },
    gap: {
      0: 'gap-0',
      1: 'gap-1',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      5: 'gap-5',
      6: 'gap-6',
      8: 'gap-8',
    },
  },
  defaultVariants: {
    direction: 'row',
    align: 'stretch',
    justify: 'start',
    wrap: 'nowrap',
  },
});

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof flexVariants> {
  as?: React.ElementType;
}

export const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ className, direction, align, justify, wrap, gap, as: Component = 'div', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(flexVariants({ direction, align, justify, wrap, gap, className }))}
        {...props}
      />
    );
  }
);
Flex.displayName = 'Flex';
