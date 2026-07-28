'use client';

import { mergeTailwindClasses as cn } from '@/design/utils';
import { Field } from '@base-ui/react/field';
import { Input as InputPrimitive } from '@base-ui/react/input';
import { cva } from 'class-variance-authority';
import type { ComponentProps, ReactNode } from 'react';

type InputProps = ComponentProps<typeof InputPrimitive> & {
  label?: ReactNode;
};

export function Input({ label, className, ...props }: InputProps) {
  return (
    <Field.Root
      data-slot={label != null ? 'input-field' : undefined}
      className={label != null ? 'flex flex-col gap-2' : undefined}
    >
      {label != null ? (
        <Field.Label className="text-body-medium-strong text-foreground-neutral-default">
          {label}
        </Field.Label>
      ) : null}
      <InputPrimitive
        data-slot="input"
        className={cn(
          cva(
            'border-border-neutral-default bg-background-neutral-default text-body-medium-default text-foreground-neutral-default placeholder:text-foreground-neutral-faded focus-visible:ring-background-brand-default w-full rounded-xl border px-4 py-3 focus-visible:ring-2 focus-visible:outline-none',
          )(),
          className,
        )}
        {...props}
      />
    </Field.Root>
  );
}
