'use client';

import { cn } from '@/design/utils';
import { ChevronDown } from 'lucide-react';
import { useRef } from 'react';
import {
  EASE_OUT,
  FADE,
  FadeSurface,
  FLAGS,
  NONE_LABEL,
  OptionCard,
  Screen,
  useAnswers,
  useClipped,
} from './parts';

export default function StickyNoneOfTheAbove() {
  const answers = useAnswers();
  const footerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const noneRef = useRef<HTMLButtonElement>(null);
  const isClipped = useClipped(listRef, footerRef);

  function handleScroll() {
    const isReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: isReduced ? 'auto' : 'smooth',
    });
    noneRef.current!.focus({ preventScroll: true });
  }

  return (
    <Screen
      footerRef={footerRef}
      canContinue={answers.canContinue}
      label="Select all that apply"
      surface={
        <>
          <FadeSurface
            height={`calc(var(--footer-h) - var(--footer-pad) + ${FADE}px)`}
          />
          <button
            type="button"
            aria-label="Scroll to the end of the list"
            inert={!isClipped}
            onClick={handleScroll}
            className={cn(
              'fixed right-4 bottom-[calc(var(--footer-h)+8px)] z-30 flex size-12 cursor-pointer items-center justify-center rounded-full border border-[#dbdbdb] bg-white text-[#0d0d0d] shadow-[0_4px_16px_rgba(13,13,13,0.12)] outline-none hover:bg-[#f5f5f5] focus-visible:ring-2 focus-visible:ring-[#4a89e8] focus-visible:ring-offset-2 motion-safe:transition-[opacity,translate,background-color] motion-safe:duration-300 lg:right-auto lg:left-1/2 lg:-translate-x-1/2',
              !isClipped && 'pointer-events-none translate-y-3 opacity-0',
            )}
            style={{ transitionTimingFunction: EASE_OUT }}
          >
            <ChevronDown className="size-5" strokeWidth={1.75} />
          </button>
        </>
      }
    >
      {(labelId) => (
        <div
          ref={listRef}
          role="group"
          aria-labelledby={labelId}
          className="flex flex-col gap-4"
        >
          {FLAGS.map((flag, index) => (
            <OptionCard
              key={flag}
              label={flag}
              checked={answers.flags.has(index)}
              disabled={answers.none}
              onToggle={() => answers.toggleFlag(index)}
            />
          ))}
          <OptionCard
            ref={noneRef}
            label={NONE_LABEL}
            checked={answers.none}
            onToggle={answers.toggleNone}
          />
        </div>
      )}
    </Screen>
  );
}
