'use client';

import { cn } from '@/design/utils';
import { Clock } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import icGift from './assets/ic-gift.svg';
import kitClosed from './assets/kit-closed.webp';
import { assetSrc } from './shell';
import { useTuning } from './tuning';

const EASE = [0.2, 1, 0.4, 1] as const;
const RAIL_EASE = [0.25, 0.9, 0.35, 1] as const;

const KIT_GRADIENT =
  'bg-linear-to-br from-[#fbe3ea] via-[#ece5fb] to-[#d6e6fd]';

const RAIL_GRADIENT =
  'bg-[linear-gradient(to_bottom,#4a89e8_0%,#6c9eeb_24%,#b5c7e6_48%,#cfc3e8_74%,#be95e5_100%)]';

type StepState = 'done' | 'current' | 'upcoming';

interface JourneyStep {
  title: string;
  meta?: string;
  description?: string;
  state: StepState;
}

const JOURNEY: JourneyStep[] = [
  { title: 'Account created', state: 'done' },
  {
    title: 'Tell us about yourself',
    meta: 'About 5 min',
    description: 'So we can match you with your own physical therapist.',
    state: 'current',
  },
  {
    title: 'Unlock your personalized program',
    description: 'Perform a few exercises in the Sword app.',
    state: 'upcoming',
  },
];

function useEnterContent() {
  const isReduced = useReducedMotion();
  const { stepDuration, stepDistance, contentDelay, rowStagger } = useTuning();
  return (order: number) => ({
    initial: isReduced ? false : { opacity: 0, y: Math.round(stepDistance * 0.45) },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: stepDuration * 0.65,
      delay: isReduced ? 0 : contentDelay + order * rowStagger * 0.65,
      ease: EASE,
    },
  });
}

function DoneMarker({
  delay,
  checkDelay,
}: {
  delay: number;
  checkDelay: number;
}) {
  const isReduced = useReducedMotion();
  return (
    <span className="relative z-10 flex size-8 shrink-0 items-center justify-center">
      {!isReduced && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full bg-[#4a89e8]/35"
          initial={{ scale: 1, opacity: 0 }}
          animate={{ scale: [1, 1.85], opacity: [0.65, 0] }}
          transition={{ duration: 0.9, delay: checkDelay, ease: EASE }}
        />
      )}
      <motion.span
        initial={isReduced ? false : { opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, delay: isReduced ? 0 : delay, ease: EASE }}
        className="relative flex size-8 items-center justify-center rounded-full bg-[#4a89e8] text-white"
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className="size-4"
        >
          <motion.path
            d="M3.5 8.5L6.5 11.5L12.5 5"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={isReduced ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              pathLength: {
                duration: 0.38,
                delay: isReduced ? 0 : checkDelay,
                ease: EASE,
              },
              opacity: {
                duration: 0.08,
                delay: isReduced ? 0 : checkDelay,
              },
            }}
          />
        </svg>
      </motion.span>
    </span>
  );
}

function Marker({
  state,
  delay,
}: {
  state: Exclude<StepState, 'done'> | 'kit';
  delay: number;
}) {
  const isReduced = useReducedMotion();
  return (
    <motion.span
      initial={isReduced ? false : { opacity: 0, scale: 0.65 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay: isReduced ? 0 : delay, ease: EASE }}
      className={cn(
        'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_0_0_4px_white]',
        state === 'current' && 'border-2 border-[#4a89e8]',
        state === 'upcoming' && 'border-[1.5px] border-[#e0e0e0]',
        state === 'kit' && KIT_GRADIENT,
      )}
    >
      {state === 'current' && (
        <motion.span
          initial={isReduced ? false : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.3,
            delay: isReduced ? 0 : delay + 0.08,
            ease: EASE,
          }}
          className="size-2.5 rounded-full bg-[#4a89e8]"
        />
      )}
      {state === 'kit' && (
        <img alt="" src={assetSrc(icGift)} className="size-5" />
      )}
    </motion.span>
  );
}

function TimeBadge({
  children,
  delay,
}: {
  children: ReactNode;
  delay: number;
}) {
  const isReduced = useReducedMotion();
  return (
    <motion.span
      initial={isReduced ? false : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay: isReduced ? 0 : delay, ease: EASE }}
      className="inline-flex items-center gap-1 rounded-full bg-[#eaf2fe] px-2.5 py-1 text-[12px] leading-4 font-semibold tracking-[0.1px] text-[#2f5aa3]"
    >
      <Clock
        className="size-3 shrink-0"
        strokeWidth={2.25}
        aria-hidden="true"
      />
      <span>{children}</span>
    </motion.span>
  );
}

function BoxImage({ className, delay }: { className: string; delay: number }) {
  const isReduced = useReducedMotion();
  return (
    <motion.img
      alt="Sword Thrive welcome kit box"
      src={assetSrc(kitClosed)}
      className={cn(
        'pointer-events-none drop-shadow-[0_24px_32px_rgba(26,38,77,0.2)]',
        className,
      )}
      initial={
        isReduced ? false : { opacity: 0, y: 32, rotate: -6, scale: 0.92 }
      }
      animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
      transition={{ duration: 1.6, delay: isReduced ? 0 : delay, ease: EASE }}
    />
  );
}

export function KitFinish() {
  const isReduced = useReducedMotion();
  const enterContent = useEnterContent();
  const { contentDelay, rowStagger } = useTuning();

  const doneDelay = contentDelay + 0.16;
  const checkDelay = doneDelay + 0.14;
  const railDelay = checkDelay + 0.16;
  const railDuration = Math.max(0.85, rowStagger * 4.75);

  const markerDelays = [
    doneDelay,
    railDelay + railDuration * 0.05,
    railDelay + railDuration * 0.24,
    railDelay + railDuration * 0.55,
  ];

  return (
    <div className="flex flex-col">
      <div className="relative flex flex-col">
        <motion.span
          aria-hidden="true"
          initial={
            isReduced ? false : { clipPath: 'inset(0% 0% 100% 0%)', opacity: 0 }
          }
          animate={{ clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 }}
          transition={{
            clipPath: {
              duration: railDuration,
              delay: isReduced ? 0 : railDelay,
              ease: RAIL_EASE,
            },
            opacity: {
              duration: 0.14,
              delay: isReduced ? 0 : railDelay,
            },
          }}
          className={cn(
            'pointer-events-none absolute top-9 -bottom-10 left-[15px] z-0 w-0.5 rounded-full',
            RAIL_GRADIENT,
          )}
        />
        {JOURNEY.map((step, index) => (
          <div key={step.title} className="relative z-10 flex gap-4">
            <div className="flex w-8 shrink-0 flex-col items-center">
              {step.state === 'done' ? (
                <DoneMarker delay={doneDelay} checkDelay={checkDelay} />
              ) : (
                <Marker state={step.state} delay={markerDelays[index]} />
              )}
            </div>
            <motion.div
              {...enterContent(index)}
              className={cn(
                'flex min-w-0 flex-1 flex-col gap-1 pt-1',
                step.state === 'done' ? 'pb-5' : 'pb-6',
              )}
            >
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <p
                  className={cn(
                    'text-[16px] leading-[24px] font-semibold tracking-[0.2px]',
                    step.state === 'done' && 'text-[#5e5e5e]',
                    step.state === 'upcoming' && 'opacity-70',
                  )}
                >
                  {step.title}
                </p>
                {step.meta && (
                  <TimeBadge delay={markerDelays[index] + 0.14}>
                    {step.meta}
                  </TimeBadge>
                )}
              </div>
              {step.description && (
                <p
                  className={cn(
                    'text-[14px] leading-5 tracking-[0.2px] text-[#5e5e5e]',
                    step.state === 'upcoming' && 'opacity-70',
                  )}
                >
                  {step.description}
                </p>
              )}
            </motion.div>
          </div>
        ))}
      </div>
      <div className="relative z-10 flex gap-4">
        <div className="flex w-8 shrink-0 justify-center pt-6">
          <Marker state="kit" delay={markerDelays[JOURNEY.length]} />
        </div>
        <motion.div
          {...enterContent(JOURNEY.length)}
          className={cn(
            'relative flex min-w-0 flex-1 flex-col gap-2 rounded-3xl p-6 max-sm:pt-[132px] sm:min-h-[156px] sm:pr-[46%]',
            KIT_GRADIENT,
          )}
        >
          <p className="font-serif text-[24px] leading-8 tracking-[-0.3px]">
            Your welcome kit
          </p>
          <p className="text-[14px] leading-5 tracking-[0.2px] text-[#3d3d3d]">
            A gift from Sword with accessories to support you during your
            program
          </p>
          <BoxImage
            delay={markerDelays[JOURNEY.length] + 0.08}
            className="absolute -top-10 left-1/2 w-[64%] -translate-x-1/2 sm:top-auto sm:right-[-6%] sm:bottom-[10%] sm:left-auto sm:w-[52%] sm:translate-x-0"
          />
        </motion.div>
      </div>
    </div>
  );
}
