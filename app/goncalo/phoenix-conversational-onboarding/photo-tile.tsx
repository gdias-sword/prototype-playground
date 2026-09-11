import { cn } from '@/design/utils';
import { Check } from 'lucide-react';

export function PhotoTile({
  label,
  image,
  selected,
  checkbox,
  onClick,
}: {
  label: string;
  image: string;
  selected?: boolean;
  checkbox?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className="relative h-[120px] w-full cursor-pointer overflow-hidden rounded-2xl border-2 border-white shadow-[0_3px_6px_rgba(31,34,44,0.05)]"
    >
      <img
        alt=""
        src={image}
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent from-50% to-black/80" />
      <span className="text-title-small-strong absolute inset-x-4 bottom-3 text-left text-white">
        {label}
      </span>
      {checkbox ? (
        <span
          aria-hidden
          className={cn(
            'absolute top-2.5 right-2.5 flex size-5 items-center justify-center rounded-[4px]',
            selected
              ? 'bg-background-brand-default'
              : 'bg-background-neutral-default',
          )}
        >
          {selected ? (
            <Check
              className="text-foreground-neutral-inverse size-3"
              strokeWidth={3}
            />
          ) : null}
        </span>
      ) : null}
    </button>
  );
}
