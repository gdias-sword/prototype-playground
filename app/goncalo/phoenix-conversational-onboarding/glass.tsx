import { mergeTailwindClasses as cn } from '@/design/utils';
import { Check } from 'lucide-react';
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

/**
 * Shared glassmorphism surface treatment: translucent white surface with
 * blur and a soft violet-tinted shadow. Radius, sizing and layout are left
 * to the caller so this can back both pill-shaped chips and other shapes
 * (e.g. rounded-2xl buttons, circular date pickers) while staying visually
 * consistent.
 */
export function glassSurfaceClasses({
  selected,
  interactive = true,
  className,
}: {
  selected?: boolean;
  interactive?: boolean;
  className?: string;
} = {}) {
  return cn(
    'border border-white/70 bg-white/55 shadow-[0_8px_32px_rgba(80,70,140,0.08)] backdrop-blur-xl transition-[transform,background-color,box-shadow] duration-300',
    interactive && 'hover:bg-white/75 active:scale-[0.98]',
    selected &&
      'border-white bg-white/88 shadow-[0_10px_40px_rgba(90,80,180,0.14)]',
    className,
  );
}

export function GlassChip({
  className,
  selected,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return (
    <button
      type="button"
      className={glassSurfaceClasses({
        selected,
        className: cn(
          'text-body-large-subtle text-foreground-neutral-strong w-full cursor-pointer rounded-full px-5 py-3.5 text-left',
          className,
        ),
      })}
      {...props}
    />
  );
}

export function GlassCheckRow({
  children,
  className,
  selected,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      className={glassSurfaceClasses({
        selected,
        className: cn(
          'flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left',
          className,
        ),
      })}
      {...props}
    >
      <span className="text-body-large-subtle text-foreground-neutral-strong min-w-0 flex-1">
        {children}
      </span>
      <span
        aria-hidden
        className={cn(
          'flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-[background-color,border-color] duration-300',
          selected
            ? 'border-background-brand-default bg-background-brand-default'
            : 'border-border-neutral-default bg-background-neutral-default',
        )}
      >
        {selected ? (
          <Check
            className="text-foreground-neutral-inverse size-3"
            strokeWidth={3}
          />
        ) : null}
      </span>
    </button>
  );
}

export function GlassField({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'text-body-large-default text-foreground-neutral-strong placeholder:text-foreground-neutral-faded w-full rounded-full border border-white/70 bg-white/55 px-5 py-3.5 shadow-[0_8px_32px_rgba(80,70,140,0.08)] backdrop-blur-xl outline-none',
        'focus:border-white focus:bg-white/80',
        className,
      )}
      {...props}
    />
  );
}
