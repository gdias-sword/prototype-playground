'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';

export type RewardVariantKey = 'A' | 'B' | 'C' | 'D';

export const REWARD_VARIANTS: {
  key: RewardVariantKey;
  name: string;
}[] = [
  { key: 'A', name: 'Unwrap the light' },
  { key: 'B', name: 'Break the seal' },
  { key: 'C', name: 'Energy made tangible' },
  { key: 'D', name: 'Prize showroom' },
];

export function readRewardVariant(): RewardVariantKey {
  if (typeof window === 'undefined') return 'A';
  const value = new URLSearchParams(window.location.search).get('variant');
  return value === 'A' || value === 'B' || value === 'C' || value === 'D'
    ? value
    : 'A';
}

function writeRewardVariant(variant: RewardVariantKey) {
  const url = new URL(window.location.href);
  url.searchParams.set('variant', variant);
  window.history.replaceState({}, '', url);
}

export function RewardVariantSwitcher({
  current,
  onChange,
}: {
  current: RewardVariantKey;
  onChange: (variant: RewardVariantKey) => void;
}) {
  const index = REWARD_VARIANTS.findIndex((item) => item.key === current);
  const active = REWARD_VARIANTS[index] ?? REWARD_VARIANTS[0];

  function cycle(direction: -1 | 1) {
    const next =
      REWARD_VARIANTS[
        (index + direction + REWARD_VARIANTS.length) % REWARD_VARIANTS.length
      ];
    writeRewardVariant(next.key);
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
    <div className="bg-background-neutral-inverse/92 text-foreground-neutral-inverse fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/12 py-1 pr-3 pl-1 shadow-[0_8px_28px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <button
        type="button"
        aria-label="Previous reward variant"
        onClick={() => cycle(-1)}
        className="flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-white/10"
      >
        <ChevronLeft className="size-4" />
      </button>
      <p className="text-body-small-subtle min-w-56 text-center">
        {active.key} — {active.name}
      </p>
      <button
        type="button"
        aria-label="Next reward variant"
        onClick={() => cycle(1)}
        className="flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-white/10"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
