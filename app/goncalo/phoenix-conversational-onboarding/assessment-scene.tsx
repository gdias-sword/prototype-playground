'use client';

import { mergeTailwindClasses as cn } from '@/design/utils';
import assessmentMember from './assets/assessment-member.webp';

function assetSrc(asset: string | { src: string }) {
  return typeof asset === 'string' ? asset : asset.src;
}

export type AssessmentBeat = 'placement' | 'exercise';

export function AssessmentScene({
  beat,
  onAdvance,
}: {
  beat: AssessmentBeat;
  onAdvance: () => void;
}) {
  const isExercise = beat === 'exercise';

  return (
    <button
      type="button"
      onClick={onAdvance}
      className="absolute inset-0 cursor-pointer overflow-hidden bg-black text-left"
      aria-label={
        isExercise
          ? 'Continue after movement check'
          : 'Continue after camera setup'
      }
    >
      <img
        alt=""
        src={assetSrc(assessmentMember)}
        className="absolute inset-0 size-full object-cover object-[center_15%]"
      />
      {isExercise ? null : (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center px-6',
            'bg-background-neutral-inverse/80 backdrop-blur-md',
          )}
        >
          <p className="text-display-small-strong text-foreground-neutral-inverse text-center font-serif font-medium tracking-[-0.02em]">
            Take a step back so we can see your entire body within the circle.
          </p>
        </div>
      )}
    </button>
  );
}
