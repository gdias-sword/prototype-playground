'use client';

import { mergeTailwindClasses as cn } from '@/lib/utils';
import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center text-body-medium-strong whitespace-nowrap transition-all',
  {
    variants: {
      variant: {
        solid:
          'bg-background-brand-default text-foreground-neutral-inverse hover:bg-background-brand-strong',
        outline:
          'border border-border-neutral-inverse hover:bg-background-neutral-inverse hover:text-foreground-neutral-inverse',
        ghost:
          'bg-background-neutral-subtle hover:bg-background-neutral-strong',
        link: 'underline-offset-4 hover:underline',
      },
      size: {
        small: 'py-3 gap-2 px-4 rounded-xl',
        medium: 'py-3 gap-2 px-5 rounded-2xl',
        large: 'py-5 gap-2 px-6 rounded-3xl',
      },
    },
    defaultVariants: {
      variant: 'solid',
      size: 'medium',
    },
  },
);

function Button({
  className,
  variant = 'solid',
  size = 'medium',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
