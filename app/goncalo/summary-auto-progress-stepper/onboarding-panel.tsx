'use client';

import meshGradient from '@/design/assets/gradients/thrive-mesh-gradient-01.png';
import { cn } from '@/design/utils';
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { useRef, useState } from 'react';

const STEP_DURATION = 5000;

type PauseReason = 'hover' | 'focus';

interface Step {
  label: string;
}

const STEPS: Step[] = [
  { label: 'Personalize your program' },
  { label: 'Unlock your free welcome kit' },
  { label: 'Meet your Physical Therapist' },
];

function assetSrc(asset: string | { src: string }) {
  return typeof asset === 'string' ? asset : asset.src;
}

function useAutoProgress(count: number, duration: number) {
  const [active, setActive] = useState(0);
  const progress = useMotionValue(0);
  const pausedBy = useRef(new Set<string>());

  useAnimationFrame((_, delta) => {
    if (pausedBy.current.size > 0) return;
    const next = progress.get() + delta / duration;
    if (next >= 1) {
      progress.set(0);
      setActive((index) => (index + 1) % count);
    } else {
      progress.set(next);
    }
  });

  function select(index: number) {
    progress.set(0);
    setActive(index);
  }

  function setPaused(reason: PauseReason, value: boolean) {
    if (value) pausedBy.current.add(reason);
    else pausedBy.current.delete(reason);
  }

  return { active, progress, select, setPaused };
}

export function OnboardingPanel() {
  const { active, progress, select, setPaused } = useAutoProgress(
    STEPS.length,
    STEP_DURATION,
  );

  return (
    <>
      <section
        aria-label="What happens next in the Sword app"
        className="relative z-3 h-[280px] w-full shrink-0 overflow-clip rounded-b-[48px] bg-linear-to-b from-white to-[#c7ddfb] lg:hidden"
      >
        <Mesh />
        <div className="absolute inset-x-0 top-4 bottom-16 flex items-center justify-center">
          <StepVisual active={active} compact />
        </div>
        <Stepper
          steps={STEPS}
          active={active}
          progress={progress}
          onSelect={select}
          onPauseChange={setPaused}
          className="bottom-4 left-1/2 w-max -translate-x-1/2"
        />
      </section>
      <aside
        aria-label="What happens next in the Sword app"
        className="absolute inset-y-0 right-0 z-3 hidden w-[42.66%] overflow-hidden bg-linear-to-b from-white to-[#c7ddfb] lg:block"
      >
        <Mesh />
        <div className="absolute inset-x-0 top-24 bottom-28 flex items-center justify-center">
          <StepVisual active={active} />
        </div>
        <Stepper
          steps={STEPS}
          active={active}
          progress={progress}
          onSelect={select}
          onPauseChange={setPaused}
          className="bottom-8 left-[15.93%] w-[417px]"
        />
      </aside>
    </>
  );
}

function Mesh() {
  return (
    <img
      alt=""
      src={assetSrc(meshGradient)}
      className="pointer-events-none absolute top-[-19.8%] left-1/2 h-[139.6%] w-auto max-w-none -translate-x-1/2 opacity-80"
    />
  );
}

function StepVisual({
  active,
  compact,
}: {
  active: number;
  compact?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const step = STEPS[active];

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={active}
        initial={
          reduceMotion
            ? { opacity: 0 }
            : { opacity: 0, y: 16, filter: 'blur(8px)' }
        }
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={
          reduceMotion
            ? { opacity: 0 }
            : { opacity: 0, y: -16, filter: 'blur(8px)' }
        }
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex size-full items-center justify-center"
      >
        <VisualPlaceholder
          step={active + 1}
          label={step.label}
          compact={compact}
        />
      </motion.div>
    </AnimatePresence>
  );
}

function Stepper({
  steps,
  active,
  progress,
  onSelect,
  onPauseChange,
  className,
}: {
  steps: Step[];
  active: number;
  progress: MotionValue<number>;
  onSelect: (index: number) => void;
  onPauseChange: (reason: PauseReason, paused: boolean) => void;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const sweep = useTransform(
    progress,
    (value) => `inset(0 ${(1 - value) * 100}% 0 0 round 12px)`,
  );
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.5, ease: [0.32, 0.72, 0, 1] as const };

  return (
    <ol
      onPointerEnter={() => onPauseChange('hover', true)}
      onPointerLeave={() => onPauseChange('hover', false)}
      onFocus={(event) => {
        if (event.target.matches(':focus-visible')) {
          onPauseChange('focus', true);
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          onPauseChange('focus', false);
        }
      }}
      className={cn(
        'absolute flex max-w-[calc(100%-32px)] items-start gap-2 rounded-[20px] bg-white/40 p-2 backdrop-blur-[10px]',
        className,
      )}
    >
      {steps.map((step, index) => {
        const isActive = index === active;
        return (
          <li key={step.label} className="flex">
            <button
              type="button"
              onClick={() => onSelect(index)}
              aria-current={isActive ? 'step' : undefined}
              aria-label={`Step ${index + 1}: ${step.label}`}
              className="group relative flex cursor-pointer items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d0d0d]"
            >
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-full bg-white/60"
                style={{
                  clipPath: isActive ? sweep : 'inset(0 0% 0 0 round 12px)',
                }}
                initial={false}
                animate={{ opacity: isActive ? 1 : 0 }}
                transition={transition}
              />
              <span
                className={cn(
                  'relative flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-[12px] leading-4 font-medium text-[#0d0d0d] transition-transform duration-200',
                  !isActive && 'group-hover:scale-110',
                )}
              >
                {index + 1}
              </span>
              <AnimatePresence initial={false}>
                {isActive ? (
                  <motion.span
                    key="label"
                    initial={{ width: 0, opacity: 0, filter: 'blur(4px)' }}
                    animate={{ width: 'auto', opacity: 1, filter: 'blur(0px)' }}
                    exit={{ width: 0, opacity: 0, filter: 'blur(4px)' }}
                    transition={transition}
                    className="relative overflow-hidden"
                  >
                    <span className="block max-w-[min(240px,calc(100vw-10rem))] truncate pr-3 pl-2 text-[14px] leading-5 font-medium tracking-[0.2px] whitespace-nowrap text-[#0d0d0d]">
                      {step.label}
                    </span>
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function VisualPlaceholder({
  step,
  label,
  compact,
}: {
  step: number;
  label: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-1 rounded-[28px] border border-dashed border-white/90 bg-white/20 text-center backdrop-blur-[2px]',
        compact
          ? 'h-[168px] w-[min(220px,62%)]'
          : 'aspect-3/4 w-[min(320px,70%)]',
      )}
    >
      <span className="text-[12px] leading-4 font-semibold tracking-[0.2px] text-[#0d0d0d]/50 uppercase">
        Step {step} visual
      </span>
      <span className="text-[14px] leading-5 font-medium tracking-[0.2px] text-[#0d0d0d]/70">
        {label}
      </span>
    </div>
  );
}
