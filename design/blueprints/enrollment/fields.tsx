'use client';

import { Input } from '@/design/components/input';
import { cn } from '@/design/utils';
import { Check } from 'lucide-react';
import { useState, type ComponentProps, type ReactNode } from 'react';
import { assetSrc } from './shell';

export function TextField({
  className,
  ...props
}: ComponentProps<typeof Input>) {
  return (
    <Input
      className={cn(
        'h-[52px] rounded-2xl border-[#c2c2c2] px-3 text-[14px]',
        className,
      )}
      {...props}
    />
  );
}

export function Checkbox({ children }: { children: ReactNode }) {
  const [isChecked, setIsChecked] = useState(false);
  return (
    <label className="flex cursor-pointer items-start gap-4 text-[14px] leading-5 tracking-[0.2px]">
      <span
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors',
          isChecked
            ? 'border-[#4a89e8] bg-[#4a89e8]'
            : 'border-[#c2c2c2] bg-white',
        )}
      >
        {isChecked && <Check className="size-4 text-white" strokeWidth={2.5} />}
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={isChecked}
        onChange={(event) => setIsChecked(event.target.checked)}
      />
      <span className="pt-1.5">{children}</span>
    </label>
  );
}

interface OptionsProps {
  options: { label: string; image?: string | { src: string } }[];
  value: string;
  onChange: (value: string) => void;
}

export function Options({ options, value, onChange }: OptionsProps) {
  const hasImages = options.some((option) => option.image);
  return (
    <div
      role="radiogroup"
      className={cn('grid gap-4', hasImages && 'sm:grid-cols-2')}
    >
      {options.map((option) => {
        const isSelected = option.label === value;
        return (
          <button
            key={option.label}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.label)}
            className={cn(
              'flex cursor-pointer items-center gap-4 rounded-2xl border bg-white text-left tracking-[0.2px] transition-[border-color,box-shadow]',
              option.image
                ? 'p-4 text-[16px] leading-[22px] font-medium'
                : 'h-[62px] px-4 text-[14px] leading-5 font-medium',
              isSelected
                ? 'border-[#4a89e8] shadow-[inset_0_0_0_1px_#4a89e8]'
                : 'border-[#c2c2c2] hover:border-[#8f8f8f]',
            )}
          >
            {option.image && (
              <img
                alt=""
                src={assetSrc(option.image)}
                className="size-[72px] shrink-0 rounded-2xl bg-[#fafafa] object-cover"
              />
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
