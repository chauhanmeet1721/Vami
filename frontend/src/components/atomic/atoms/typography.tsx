import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const typographyVariants = cva('text-foreground', {
  variants: {
    variant: {
      h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
      h2: 'scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0',
      h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
      h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
      p: 'leading-7',
      lead: 'text-xl text-muted-foreground',
      large: 'text-lg font-semibold',
      small: 'text-sm font-medium leading-none',
      muted: 'text-sm text-muted-foreground',
      span: '',
    },
  },
  defaultVariants: {
    variant: 'p',
  },
});

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: React.ElementType;
}

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, as, ...props }, ref) => {
    let Comp: React.ElementType = as || 'p';

    if (!as) {
      if (variant === 'h1') Comp = 'h1';
      else if (variant === 'h2') Comp = 'h2';
      else if (variant === 'h3') Comp = 'h3';
      else if (variant === 'h4') Comp = 'h4';
      else if (variant === 'small' || variant === 'muted' || variant === 'span') Comp = 'span';
    }

    const Element = Comp;

    return (
      <Element
        ref={ref}
        className={cn(typographyVariants({ variant, className }))}
        {...props}
      />
    );
  }
);
Typography.displayName = 'Typography';
