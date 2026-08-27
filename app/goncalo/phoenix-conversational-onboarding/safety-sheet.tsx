'use client';

import { mergeTailwindClasses as cn } from '@/design/utils';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { GlassCheckRow } from './glass';
import { SAFETY_FLAGS, SAFETY_NONE_LABEL } from './script';
import { useScrollFade } from './use-scroll-fade';

export const SAFETY_SHEET_IN_MS = 560;
export const SAFETY_SHEET_OUT_MS = 420;
export const SAFETY_DIM_MS = 480;

export function safetyFlagsSummary(flags: string[]) {
  if (flags.length === 0) return SAFETY_NONE_LABEL;
  if (flags.length === 1) return flags[0] ?? SAFETY_NONE_LABEL;
  if (flags.length === 2) return `${flags[0]} and ${flags[1]}`;
  return `${flags.slice(0, -1).join(', ')}, and ${flags[flags.length - 1]}`;
}

function WipeLabelAction({
  hasFlags,
  onClick,
}: {
  hasFlags: boolean;
  onClick: () => void;
}) {
  const label = hasFlags ? 'Continue' : SAFETY_NONE_LABEL;
  const prevLabelRef = useRef<string | null>(null);
  const shouldAnimate =
    prevLabelRef.current !== null && prevLabelRef.current !== label;

  useEffect(() => {
    prevLabelRef.current = label;
  }, [label]);

  return (
    <button
      type="button"
      onClick={onClick}
      className="text-body-large-strong bg-background-neutral-inverse text-foreground-neutral-inverse flex h-12 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl"
    >
      <span className="grid overflow-hidden">
        <span
          key={label}
          className={cn(
            'col-start-1 row-start-1',
            shouldAnimate && 'phoenix-cta-label-wipe',
          )}
        >
          {label}
        </span>
      </span>
    </button>
  );
}

export function SafetySheet({
  open,
  exiting,
  title,
  subtitle,
  onContinue,
}: {
  open: boolean;
  exiting: boolean;
  title: string;
  subtitle?: string;
  onContinue: (flags: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const { scrollerRef, fadeTop, fadeBottom, onScroll } = useScrollFade([open]);

  useEffect(() => {
    if (open && !exiting) return;
    setSelected([]);
  }, [open, exiting]);

  function toggle(flag: string) {
    setSelected((current) =>
      current.includes(flag)
        ? current.filter((item) => item !== flag)
        : [...current, flag],
    );
  }

  if (!open && !exiting) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[35] flex flex-col justify-end">
      <div
        className={cn(
          'bg-background-neutral-inverse/30 pointer-events-auto absolute inset-0',
          exiting ? 'phoenix-safety-dim-out' : 'phoenix-safety-dim-in',
        )}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="safety-sheet-title"
        className={cn(
          'bg-background-neutral-default/90 pointer-events-auto relative flex max-h-[82%] min-h-0 flex-col rounded-t-[28px] border border-white/70 shadow-[0_-12px_48px_rgba(80,70,140,0.16)] backdrop-blur-xl',
          exiting ? 'phoenix-safety-sheet-out' : 'phoenix-safety-sheet-in',
        )}
        inert={exiting || undefined}
      >
        <div className="flex shrink-0 flex-col gap-2 px-5 pt-5 pb-3">
          <h2
            id="safety-sheet-title"
            className="text-title-large-strong text-foreground-neutral-default text-left font-serif font-medium tracking-[-0.04em]"
          >
            {title}
          </h2>
          {subtitle ? (
            <p className="text-body-large-default text-foreground-neutral-default">
              {subtitle}
            </p>
          ) : null}
        </div>
        <div
          ref={scrollerRef}
          role="group"
          aria-label="Safety considerations"
          className="phoenix-chip-scroller min-h-0 flex-1 overflow-y-auto px-5 pb-3"
          data-fade-top={fadeTop || undefined}
          data-fade-bottom={fadeBottom || undefined}
          onScroll={onScroll}
        >
          <div className="flex flex-col gap-3">
            {SAFETY_FLAGS.map((flag, index) => (
              <div
                key={flag}
                className="phoenix-offer-piece"
                style={{ '--offer-stagger': index } as CSSProperties}
              >
                <GlassCheckRow
                  selected={selected.includes(flag)}
                  onClick={() => toggle(flag)}
                >
                  {flag}
                </GlassCheckRow>
              </div>
            ))}
          </div>
        </div>
        <div className="shrink-0 px-5 pt-2 pb-14">
          <WipeLabelAction
            hasFlags={selected.length > 0}
            onClick={() => onContinue(selected)}
          />
        </div>
      </div>
    </div>
  );
}
