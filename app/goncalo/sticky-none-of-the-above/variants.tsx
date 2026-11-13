'use client';

// Variants:
// A — "None" is the last list item, sticky above the CTA while the list
//     overflows; the frosted footer grows to hold it, then it docks in place.
// B — Same docking behaviour, but no visible bar: the list dissolves into the
//     page background through a mask fade that sits above the sticky option.
// C — No stickiness: "None" is pulled to the top as its own choice, with the
//     red flags below an "or select all that apply" divider.

import { cn } from '@/design/utils';
import { useEffect, useRef, useState, type RefObject } from 'react';
import {
  Backdrop,
  EASE_OUT,
  FLAGS,
  GlassSurface,
  NONE_LABEL,
  OptionCard,
  Screen,
  useAnswers,
  useHeight,
} from './parts';

const FADE = 48;

function useStuck(
  listRef: RefObject<HTMLElement | null>,
  footerRef: RefObject<HTMLElement | null>,
) {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const list = listRef.current;
    const footer = footerRef.current;
    if (!list || !footer) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const listBottom = list.getBoundingClientRect().bottom;
      const footerTop = footer.getBoundingClientRect().top;
      setStuck(listBottom > footerTop + 1);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(list);
    observer.observe(footer);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer.disconnect();
    };
  }, [listRef, footerRef]);

  return stuck;
}

function FadeSurface({ height }: { height: string }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 bottom-0 z-10 overflow-hidden motion-safe:transition-[height] motion-safe:duration-300"
      style={{
        height,
        transitionTimingFunction: EASE_OUT,
        maskImage: `linear-gradient(to top, #000 calc(100% - ${FADE}px), transparent)`,
      }}
    >
      <Backdrop className="absolute inset-x-0 bottom-0 h-dvh" />
    </div>
  );
}

function StickyDock({ surface }: { surface: 'glass' | 'fade' }) {
  const answers = useAnswers();
  const footerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const noneRef = useRef<HTMLDivElement>(null);
  const noneHeight = useHeight(noneRef);
  const stuck = useStuck(listRef, footerRef);

  const tucked = stuck && answers.flags.size > 0;
  const raised = stuck && !tucked;

  const height =
    surface === 'glass'
      ? raised
        ? `calc(var(--footer-h) + ${noneHeight + 16}px)`
        : 'var(--footer-h)'
      : raised
        ? `calc(var(--footer-h) + ${noneHeight + FADE}px)`
        : `calc(var(--footer-h) - var(--footer-pad) + ${FADE}px)`;

  return (
    <Screen
      footerRef={footerRef}
      canContinue={answers.canContinue}
      label="Select all that apply"
      surface={
        surface === 'glass' ? (
          <GlassSurface height={height} />
        ) : (
          <FadeSurface height={height} />
        )
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
          <div
            ref={noneRef}
            className={cn(
              'sticky bottom-(--footer-h) z-20 motion-safe:transition-[opacity,translate] motion-safe:duration-300',
              tucked &&
                'pointer-events-none translate-y-3 opacity-0 focus-within:pointer-events-auto focus-within:translate-y-0 focus-within:opacity-100',
            )}
            style={{ transitionTimingFunction: EASE_OUT }}
          >
            <OptionCard
              label={NONE_LABEL}
              checked={answers.none}
              onToggle={answers.toggleNone}
            />
          </div>
        </div>
      )}
    </Screen>
  );
}

export function VariantA() {
  return <StickyDock surface="glass" />;
}

export function VariantB() {
  return <StickyDock surface="fade" />;
}

export function VariantC() {
  const answers = useAnswers();
  const footerRef = useRef<HTMLDivElement>(null);

  return (
    <Screen
      footerRef={footerRef}
      canContinue={answers.canContinue}
      surface={<GlassSurface height="var(--footer-h)" />}
    >
      {() => (
        <div className="flex flex-col gap-4">
          <OptionCard
            label={NONE_LABEL}
            checked={answers.none}
            onToggle={answers.toggleNone}
          />
          <div className="flex items-center gap-3 py-2 text-[14px] leading-5 text-[#5e5e5e]">
            <span className="h-px flex-1 bg-[#dbdbdb]" />
            <span id="flags-label">Or select all that apply</span>
            <span className="h-px flex-1 bg-[#dbdbdb]" />
          </div>
          <div
            role="group"
            aria-labelledby="flags-label"
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
          </div>
        </div>
      )}
    </Screen>
  );
}
