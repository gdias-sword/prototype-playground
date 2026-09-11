'use client';

import { mergeTailwindClasses as cn } from '@/design/utils';
import {
  confettiOriginFromElement,
  useDeviceConfetti,
} from './device-confetti';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { PhoenixOrb, type PhoenixMood } from './phoenix-orb';

const COMMIT_THRESHOLD = 0.85;
const SNAP_MS = 300;
const SUCCESS_HOLD_MS = 1200;
const ORB_SIZE = 80;
const TRACK_INSET = 12;
const TRACK_HEIGHT = 104;
const LABEL_STYLE = 'text-[22px] leading-7 font-normal';
const CONFETTI_COLORS = [
  '#ff7e7e',
  '#be95e5',
  '#4a89e8',
  '#ffd166',
  '#06d6a0',
  '#ef476f',
];

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function progressFromClientX(track: HTMLDivElement, clientX: number) {
  const { left, width } = track.getBoundingClientRect();
  const travel = width - TRACK_INSET * 2 - ORB_SIZE;
  if (travel <= 0) return 0;
  return clamp01((clientX - left - TRACK_INSET - ORB_SIZE / 2) / travel);
}

function fireCommitmentConfetti(
  track: HTMLDivElement,
  frame: HTMLElement,
  fireConfetti: ReturnType<typeof useDeviceConfetti>['fireConfetti'],
) {
  const origin = confettiOriginFromElement(frame, track);

  fireConfetti({
    particleCount: 70,
    spread: 88,
    startVelocity: 34,
    gravity: 0.92,
    ticks: 220,
    origin,
    colors: CONFETTI_COLORS,
  });

  window.setTimeout(() => {
    fireConfetti({
      particleCount: 36,
      spread: 120,
      startVelocity: 26,
      gravity: 0.85,
      ticks: 180,
      origin: { x: origin.x - 0.08, y: origin.y - 0.06 },
      colors: CONFETTI_COLORS,
    });
  }, 140);
}

function SlideToCommit({ onComplete }: { onComplete: () => void }) {
  const { fireConfetti, frameRef } = useDeviceConfetti();
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const isDraggingRef = useRef(false);
  const completedRef = useRef(false);
  const completeTimeoutRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const [isCommitted, setIsCommitted] = useState(false);
  const [mood, setMood] = useState<PhoenixMood>('breath');

  const thumbTravel = `100% - ${TRACK_INSET * 2 + ORB_SIZE}px`;
  const thumbLeft = `calc(${TRACK_INSET}px + (${thumbTravel}) * ${progress})`;
  const fillWidth =
    progress <= 0
      ? '0px'
      : isCommitted
        ? '100%'
        : `calc(${TRACK_INSET}px + (${thumbTravel}) * ${progress} + ${ORB_SIZE}px + ${TRACK_INSET * progress}px)`;

  const idleHintOpacity = clamp01(1 - progress * 1.6);
  const commitLabelOpacity = clamp01((progress - 0.18) / 0.55);
  const showCommittedLabel = isCommitted || commitLabelOpacity > 0.55;

  const setProgressSafe = useCallback((next: number) => {
    const value = clamp01(next);
    progressRef.current = value;
    setProgress(value);
    setMood(value > 0.02 ? 'speak' : 'breath');
    return value;
  }, []);

  const commit = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    isDraggingRef.current = false;
    setIsDragging(false);
    setIsSnapping(false);
    progressRef.current = 1;
    setProgress(1);
    setIsCommitted(true);
    setMood('think');

    const track = trackRef.current;
    const frame = frameRef.current;
    if (track && frame) fireCommitmentConfetti(track, frame, fireConfetti);

    completeTimeoutRef.current = window.setTimeout(() => {
      onCompleteRef.current();
    }, SUCCESS_HOLD_MS);
  }, [fireConfetti, frameRef]);

  const finalizeDrag = useCallback(() => {
    if (completedRef.current) return;

    if (progressRef.current >= COMMIT_THRESHOLD) {
      commit();
      return;
    }

    setIsSnapping(true);
    setProgressSafe(0);
    window.setTimeout(() => setIsSnapping(false), SNAP_MS);
  }, [commit, setProgressSafe]);

  function updateProgress(clientX: number) {
    const track = trackRef.current;
    if (!track || completedRef.current) return;
    const next = setProgressSafe(progressFromClientX(track, clientX));
    if (next >= 1 - 0.001) {
      commit();
    }
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (completedRef.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    isDraggingRef.current = true;
    setIsDragging(true);
    setIsSnapping(false);
    updateProgress(event.clientX);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (completedRef.current) return;
    if (!isDraggingRef.current) return;
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    updateProgress(event.clientX);
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>) {
    if (completedRef.current) return;
    if (!isDraggingRef.current) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    isDraggingRef.current = false;
    setIsDragging(false);
    finalizeDrag();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (completedRef.current) return;

    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      setIsSnapping(false);
      const next = setProgressSafe(progressRef.current + 0.08);
      if (next >= COMMIT_THRESHOLD) commit();
      return;
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      setIsSnapping(false);
      setProgressSafe(progressRef.current - 0.08);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (progressRef.current >= COMMIT_THRESHOLD) {
        commit();
      } else {
        setIsSnapping(true);
        setProgressSafe(0);
        window.setTimeout(() => setIsSnapping(false), SNAP_MS);
      }
    }
  }

  useEffect(() => {
    return () => {
      if (completeTimeoutRef.current !== null) {
        window.clearTimeout(completeTimeoutRef.current);
      }
    };
  }, []);

  const motionClass = cn(
    (isSnapping || isDragging) && 'transition-none',
    !isDragging &&
      !isSnapping &&
      'transition-[left,width] duration-150 ease-out',
    isSnapping &&
      'transition-[left,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
    isCommitted &&
      'transition-[left,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
  );

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-label="Slide to commit"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      aria-valuetext={showCommittedLabel ? "Let's do it!" : 'Slide to commit'}
      tabIndex={0}
      className={cn(
        'relative w-full max-w-[343px] touch-none overflow-hidden rounded-[60px] border border-white bg-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.08)] outline-none select-none',
        isCommitted && 'pointer-events-none',
      )}
      style={{ height: TRACK_HEIGHT }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onLostPointerCapture={() => {
        if (!isDraggingRef.current || completedRef.current) return;
        isDraggingRef.current = false;
        setIsDragging(false);
        finalizeDrag();
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-y-0 left-0 rounded-[60px] bg-gradient-to-r from-[#4a89e8] to-[#eaf2fe]',
          motionClass,
        )}
        style={{ width: fillWidth }}
      />

      <p
        className={cn(
          'pointer-events-none absolute inset-y-0 flex items-center justify-center text-center transition-opacity duration-150 ease-out',
          LABEL_STYLE,
        )}
        style={{
          left: TRACK_INSET + ORB_SIZE + 8,
          right: TRACK_INSET,
          opacity: idleHintOpacity,
        }}
      >
        <span className="bg-gradient-to-r from-[#ff7e7e] via-[#be95e5] to-[#4a89e8] bg-clip-text text-transparent">
          Slide to commit
        </span>
      </p>

      <p
        className={cn(
          'pointer-events-none absolute inset-y-0 flex items-center justify-center text-center text-white transition-opacity duration-150 ease-out',
          LABEL_STYLE,
        )}
        style={{
          left: TRACK_INSET,
          right: TRACK_INSET + ORB_SIZE + 8,
          opacity: commitLabelOpacity,
        }}
      >
        Let&apos;s do it!
      </p>

      <div
        className={cn(
          'absolute top-1/2 z-10 -translate-y-1/2 overflow-hidden rounded-full bg-gradient-to-b from-[#eaf2fe] to-[#a6c9f8] shadow-[0_8px_16px_rgba(74,137,232,0.22)]',
          motionClass,
        )}
        style={{
          left: thumbLeft,
          width: ORB_SIZE,
          height: ORB_SIZE,
        }}
      >
        <PhoenixOrb mood={mood} className="relative h-full w-full" />
      </div>
    </div>
  );
}

export function RewardCommitmentScene({
  onComplete,
}: {
  onComplete: () => void;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-4 pb-24">
      <div className="flex w-full max-w-[343px] flex-col items-center gap-12">
        <h1 className="commitment-headline-enter text-title-large-strong text-foreground-neutral-default text-center font-serif font-medium tracking-[-0.04em]">
          Let&apos;s commit to feeling better
        </h1>
        <div className="commitment-slider-enter w-full">
          <SlideToCommit onComplete={onComplete} />
        </div>
      </div>
    </div>
  );
}
