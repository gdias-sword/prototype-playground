'use client';

import { cn } from '@/design/utils';
import { Field } from '@base-ui/react/field';
import { cva } from 'class-variance-authority';
import type { ComponentProps, ReactNode } from 'react';

type TextareaProps = ComponentProps<'textarea'> & {
  label?: ReactNode;
};

export function Textarea({ label, className, ref, ...props }: TextareaProps) {
  return (
    <Field.Root
      data-slot={label != null ? 'textarea-field' : undefined}
      className={label != null ? 'flex flex-col gap-2' : undefined}
    >
      {label != null ? (
        <Field.Label className="text-body-medium-strong text-foreground-neutral-default">
          {label}
        </Field.Label>
      ) : null}
      <textarea
        ref={ref}
        data-slot="textarea"
        className={cn(
          cva(
            'border-border-neutral-default bg-background-neutral-default text-body-medium-default text-foreground-neutral-default placeholder:text-foreground-neutral-faded focus-visible:ring-background-brand-default w-full rounded-xl border px-4 py-3 focus-visible:ring-2 focus-visible:outline-none',
          )(),
          'resize-y',
          className,
        )}
        {...props}
      />
    </Field.Root>
  );
}
