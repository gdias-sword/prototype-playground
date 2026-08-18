'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect } from 'react';

export const VARIANT_KEYS = ['A', 'B', 'C'] as const;
export type VariantKey = (typeof VARIANT_KEYS)[number];

export const VARIANT_NAMES: Record<VariantKey, string> = {
  A: 'Color diff',
  B: 'Chip stays',
  C: 'Two voices',
};

export function readVariantParam(): VariantKey {
  if (typeof window === 'undefined') return 'A';
  const value = new URLSearchParams(window.location.search).get('variant');
  if (value === 'B' || value === 'C') return value;
  return 'A';
}

export function VariantSwitcher({
  current,
  onChange,
}: {
  current: VariantKey;
  onChange: (next: VariantKey) => void;
}) {
  const index = VARIANT_KEYS.indexOf(current);

  const go = useCallback(
    (direction: -1 | 1) => {
      const next =
        VARIANT_KEYS[
          (index + direction + VARIANT_KEYS.length) % VARIANT_KEYS.length
        ];
      const url = new URL(window.location.href);
      url.searchParams.set('variant', next);
      window.history.replaceState({}, '', url);
      onChange(next);
    },
    [index, onChange],
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.closest(
          'input, textarea, select, [contenteditable="true"], [role="slider"]',
        )
      ) {
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        go(-1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        go(1);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [go]);

  return (
    <div className="bg-background-neutral-inverse/90 text-foreground-neutral-inverse fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/12 px-1.5 py-1.5 shadow-[0_8px_28px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <button
        type="button"
        aria-label="Previous variant"
        onClick={() => go(-1)}
        className="flex size-8 cursor-pointer items-center justify-center rounded-full hover:bg-white/10"
      >
        <ChevronLeft className="size-4" />
      </button>
      <p className="text-body-small-subtle min-w-[168px] text-center">
        {current} — {VARIANT_NAMES[current]}
      </p>
      <button
        type="button"
        aria-label="Next variant"
        onClick={() => go(1)}
        className="flex size-8 cursor-pointer items-center justify-center rounded-full hover:bg-white/10"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
