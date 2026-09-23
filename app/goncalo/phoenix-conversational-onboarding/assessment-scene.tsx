'use client';

import { cn } from '@/design/utils';
import { ArrowDown, Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import assessmentMember from './assets/assessment-member.webp';

function assetSrc(asset: string | { src: string }) {
  return typeof asset === 'string' ? asset : asset.src;
}

export type AssessmentBeat = 'placement' | 'exercise';

type PlacementPhase = 'dial' | 'confirmed' | 'step-back';

function timing(fastDemo: boolean, ms: number) {
  return fastDemo ? Math.min(ms, 280) : ms;
}

export function AssessmentScene({
  beat,
  fastDemo = false,
  onAdvance,
}: {
  beat: AssessmentBeat;
  fastDemo?: boolean;
  onAdvance: () => void;
}) {
  const [placementPhase, setPlacementPhase] = useState<PlacementPhase>('dial');
  const onAdvanceRef = useRef(onAdvance);
  onAdvanceRef.current = onAdvance;

  useEffect(() => {
    setPlacementPhase('dial');
  }, [beat]);

  useEffect(() => {
    if (beat !== 'placement') return;
    if (placementPhase === 'dial') {
      const id = window.setTimeout(
        () => setPlacementPhase('confirmed'),
        timing(fastDemo, 1400),
      );
      return () => window.clearTimeout(id);
    }
    if (placementPhase === 'confirmed') {
      const id = window.setTimeout(
        () => setPlacementPhase('step-back'),
        timing(fastDemo, 900),
      );
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => onAdvanceRef.current(), timing(fastDemo, 1800));
    return () => window.clearTimeout(id);
  }, [beat, placementPhase, fastDemo]);

  useEffect(() => {
    if (beat !== 'exercise') return;
    const id = window.setTimeout(() => onAdvanceRef.current(), timing(fastDemo, 1800));
    return () => window.clearTimeout(id);
  }, [beat, fastDemo]);

  function handleSkip() {
    if (beat === 'placement') {
      if (placementPhase === 'dial') {
        setPlacementPhase('confirmed');
        return;
      }
      if (placementPhase === 'confirmed') {
        setPlacementPhase('step-back');
        return;
      }
      onAdvance();
      return;
    }
    onAdvance();
  }

  const showStepBack = beat === 'placement' && placementPhase === 'step-back';

  return (
    <button
      type="button"
      onClick={handleSkip}
      className="absolute inset-0 cursor-pointer overflow-hidden bg-black text-left"
      aria-label={
        beat === 'exercise'
          ? 'Continue after movement check'
          : 'Continue after camera setup'
      }
    >
      <img
        alt=""
        src={assetSrc(assessmentMember)}
        className={cn(
          'absolute inset-0 size-full object-cover object-[center_15%]',
          beat === 'placement' && 'scale-110 blur-md',
        )}
      />
      <div className="absolute inset-0 bg-black/35" />

      {beat === 'placement' && !showStepBack ? (
        <PlacementDial confirmed={placementPhase === 'confirmed'} />
      ) : null}

      {showStepBack ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/55 px-8">
          <p className="text-display-small-strong text-center font-serif font-medium tracking-[-0.02em] text-white">
            Now take a step back so we can see your entire body within the
            circle.
          </p>
        </div>
      ) : null}
    </button>
  );
}

function PlacementDial({ confirmed }: { confirmed: boolean }) {
  return (
    <div className="absolute inset-0">
      <div className="absolute top-[88px] left-1/2 size-[512px] -translate-x-1/2">
        {[176, 288, 400, 512].map((size) => (
          <div
            key={size}
            className="absolute top-1/2 left-1/2 rounded-full border border-white/35"
            style={{
              width: size,
              height: size,
              marginLeft: -size / 2,
              marginTop: -size / 2,
            }}
          />
        ))}
        <div
          className={cn(
            'absolute left-1/2 flex size-[118px] -translate-x-1/2 items-center justify-center rounded-full border-[3px] border-dashed border-white/70 transition-[top,background-color,border-color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
            confirmed
              ? 'top-1/2 -translate-y-1/2 border-solid border-[#16a34a] bg-[#16a34a]'
              : 'top-[32px] bg-white/90',
          )}
        >
          {confirmed ? (
            <Check className="size-10 text-white" strokeWidth={3} />
          ) : (
            <ArrowDown className="text-foreground-neutral-default size-10" />
          )}
        </div>
      </div>
      <p className="absolute inset-x-6 bottom-16 text-center font-serif text-[28px] leading-8 font-medium tracking-[-0.03em] text-white">
        Place your device on the floor and tilt it toward you
      </p>
    </div>
  );
}
