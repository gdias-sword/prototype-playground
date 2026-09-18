'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';
import {
  cycleVariant,
  variantName,
  type RewindVariantKey,
} from './rewind-variants';

export function VariantSwitcher({
  current,
  onChange,
}: {
  current: RewindVariantKey;
  onChange: (key: RewindVariantKey) => void;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.closest('input, textarea, select, [contenteditable="true"]')
      ) {
        return;
      }

      event.preventDefault();
      onChange(cycleVariant(current, event.key === 'ArrowLeft' ? -1 : 1));
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [current, onChange]);

  return (
    <div className="bg-background-neutral-inverse/90 fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center rounded-2xl border border-white/12 shadow-[0_12px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl">
      <button
        type="button"
        aria-label="Previous variant"
        onClick={() => onChange(cycleVariant(current, -1))}
        className="text-foreground-neutral-inverse flex size-11 cursor-pointer items-center justify-center rounded-l-2xl hover:bg-white/10"
      >
        <ChevronLeft className="size-4" />
      </button>
      <p className="text-body-small-subtle text-foreground-neutral-inverse min-w-60 px-1 text-center whitespace-nowrap">
        <span className="font-semibold">{current}</span>
        <span className="text-white/40"> — </span>
        {variantName(current)}
      </p>
      <button
        type="button"
        aria-label="Next variant"
        onClick={() => onChange(cycleVariant(current, 1))}
        className="text-foreground-neutral-inverse flex size-11 cursor-pointer items-center justify-center rounded-r-2xl hover:bg-white/10"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
