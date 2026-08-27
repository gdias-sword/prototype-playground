'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';
import {
  SAFETY_BACKDROPS,
  safetyBackdropName,
  writeSafetyBackdrop,
  type SafetyBackdrop,
} from './safety-variants';

function cycle(current: SafetyBackdrop, direction: -1 | 1) {
  const keys = SAFETY_BACKDROPS.map((item) => item.key);
  const index = keys.indexOf(current);
  return keys[(index + direction + keys.length) % keys.length] ?? current;
}

export function SafetyVariantSwitcher({
  current,
  onChange,
}: {
  current: SafetyBackdrop;
  onChange: (backdrop: SafetyBackdrop) => void;
}) {
  function setBackdrop(backdrop: SafetyBackdrop) {
    writeSafetyBackdrop(backdrop);
    onChange(backdrop);
  }

  function cycleBackdrop(direction: -1 | 1) {
    setBackdrop(cycle(current, direction));
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
        cycleBackdrop(-1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        cycleBackdrop(1);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, onChange]);

  return (
    <div className="bg-background-neutral-inverse/92 text-foreground-neutral-inverse fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/12 py-1 pr-2 pl-1 shadow-[0_8px_28px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <button
        type="button"
        aria-label="Previous backdrop"
        onClick={() => cycleBackdrop(-1)}
        className="flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-white/10"
      >
        <ChevronLeft className="size-4" />
      </button>
      <p className="text-body-small-subtle min-w-56 text-center">
        {safetyBackdropName(current)}
      </p>
      <button
        type="button"
        aria-label="Next backdrop"
        onClick={() => cycleBackdrop(1)}
        className="flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-white/10"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
