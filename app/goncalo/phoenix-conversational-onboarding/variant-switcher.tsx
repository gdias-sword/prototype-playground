'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';
import { mergeTailwindClasses as cn } from '@/design/utils';

export type VariantKey = 'A' | 'B' | 'C';

export const VARIANTS: { key: VariantKey; name: string }[] = [
  { key: 'A', name: 'Regions' },
  { key: 'B', name: 'Body map' },
  { key: 'C', name: 'Voice / text' },
];

export function readVariantParam(): VariantKey {
  if (typeof window === 'undefined') return 'A';
  const value = new URLSearchParams(window.location.search).get('variant');
  if (value === 'A' || value === 'B' || value === 'C') return value;
  return 'A';
}

function writeVariantParam(variant: VariantKey) {
  const url = new URL(window.location.href);
  url.searchParams.set('variant', variant);
  window.history.replaceState({}, '', url);
}

export function VariantSwitcher({
  current,
  onChange,
}: {
  current: VariantKey;
  onChange: (next: VariantKey) => void;
}) {
  const index = VARIANTS.findIndex((item) => item.key === current);
  const active = VARIANTS[index] ?? VARIANTS[0];

  function cycle(direction: -1 | 1) {
    const next = VARIANTS[(index + direction + VARIANTS.length) % VARIANTS.length];
    writeVariantParam(next.key);
    onChange(next.key);
  }

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
        cycle(-1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        cycle(1);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, onChange]);

  return (
    <div
      className={cn(
        'bg-background-neutral-inverse/90 text-foreground-neutral-inverse fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/12 py-1 pr-3 pl-1 shadow-[0_8px_28px_rgba(0,0,0,0.22)] backdrop-blur-xl',
      )}
    >
      <button
        type="button"
        aria-label="Previous variant"
        className="flex size-9 cursor-pointer items-center justify-center rounded-full hover:bg-white/10"
        onClick={() => cycle(-1)}
      >
        <ChevronLeft className="size-4" />
      </button>
      <p className="text-body-small-subtle min-w-44 text-center">
        {active.key} — {active.name}
      </p>
      <button
        type="button"
        aria-label="Next variant"
        className="flex size-9 cursor-pointer items-center justify-center rounded-full hover:bg-white/10"
        onClick={() => cycle(1)}
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}

