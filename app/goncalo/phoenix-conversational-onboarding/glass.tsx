import { mergeTailwindClasses as cn } from '@/design/utils';
import type { ButtonHTMLAttributes, InputHTMLAttributes } from 'react';

export function GlassChip({
  className,
  selected,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        'text-body-large-subtle text-foreground-neutral-strong w-full cursor-pointer rounded-full px-5 py-3.5 text-left shadow-[0_8px_32px_rgba(80,70,140,0.08)] transition-[transform,background-color,box-shadow] duration-300',
        'border border-white/70 bg-white/55 backdrop-blur-xl',
        'hover:bg-white/75 active:scale-[0.98]',
        selected &&
          'border-white bg-white/88 shadow-[0_10px_40px_rgba(90,80,180,0.14)]',
        className,
      )}
      {...props}
    />
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

export function SolidContinue({
  className,
  glassy,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { glassy?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        'text-body-large-strong h-12 w-full cursor-pointer rounded-[14px] transition-[background-color,color,box-shadow,backdrop-filter] duration-500',
        glassy
          ? 'text-foreground-neutral-strong border border-white/70 bg-white/55 shadow-[0_8px_32px_rgba(80,70,140,0.08)] backdrop-blur-xl'
          : 'bg-background-brand-default text-foreground-neutral-inverse hover:bg-background-brand-strong',
        className,
      )}
      {...props}
    />
  );
}

export function ProgressDots({
  count,
  index,
}: {
  count: number;
  index: number;
}) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={cn(
            'h-1.5 rounded-full transition-all duration-500',
            i === index
              ? 'bg-background-brand-default w-5'
              : 'bg-background-brand-faded w-1.5',
          )}
        />
      ))}
    </div>
  );
}
