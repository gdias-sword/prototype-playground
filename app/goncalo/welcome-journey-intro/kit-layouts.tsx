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

const PRIMARY_WASH =
  'linear-gradient(157deg, color-mix(in srgb, #ff7e7e 20%, transparent) 0%, color-mix(in srgb, #be95e5 20%, transparent) 50%, color-mix(in srgb, #4a89e8 20%, transparent) 100%)';

const RAIL_GRADIENT =
  'linear-gradient(to bottom, var(--color-background-brand-default) 0%, #b5c7e6 49%, #be95e5 100%)';

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
    meta: '5 min',
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

function DoneMarker({ delay }: { delay: number }) {
  const isReduced = useReducedMotion();
  return (
    <motion.span
      initial={isReduced ? false : { opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay: isReduced ? 0 : delay, ease: EASE }}
      className="text-foreground-neutral-default/50 relative z-10 flex size-4 shrink-0 items-center justify-center"
    >
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4">
        <path
          d="M14.166 3.434a.8.8 0 0 1 0 1.132l-7.467 7.466a.8.8 0 0 1-1.131 0L1.834 8.299a.8.8 0 1 1 1.132-1.132L6.133 10.335l6.901-6.901a.8.8 0 0 1 1.132 0Z"
          fill="currentColor"
        />
      </svg>
    </motion.span>
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
        'relative z-10 flex shrink-0 items-center justify-center rounded-full shadow-[0_0_0_2px_var(--color-white)]',
        state === 'kit' && 'size-8',
        state === 'current' &&
          'bg-background-brand-default size-4 border border-white',
        state === 'upcoming' &&
          'border-border-neutral-default bg-background-neutral-default size-4 border-2',
      )}
      style={state === 'kit' ? { backgroundImage: PRIMARY_WASH } : undefined}
    >
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
      className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf2fe] px-2.5 py-1 text-[12px] leading-4 font-semibold tracking-[0.1px] text-[#2f5aa3]"
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

function BoxImage({ delay }: { delay: number }) {
  const isReduced = useReducedMotion();
  return (
    <motion.img
      alt="Sword Thrive welcome kit box"
      src={assetSrc(kitClosed)}
      className="pointer-events-none absolute top-2.5 -right-7 aspect-[1000/704] w-[216px] max-w-[42%] object-contain"
      initial={isReduced ? false : { opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
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
    railDelay + railDuration * 0.4,
    railDelay + railDuration * 0.72,
  ];

  const [done, current, upcoming] = JOURNEY;

  return (
    <div className="flex flex-col">
      <div className="flex gap-4">
        <div className="flex w-8 shrink-0 justify-center pt-1">
          <DoneMarker delay={doneDelay} />
        </div>
        <motion.p
          {...enterContent(0)}
          className="text-body-large-strong text-foreground-neutral-default/50 pb-6"
        >
          {done.title}
        </motion.p>
      </div>

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
          className="pointer-events-none absolute top-6 -bottom-1 left-[15px] z-0 w-0.5 rounded-full"
          style={{ backgroundImage: RAIL_GRADIENT }}
        />

        {[current, upcoming].map((step, index) => (
          <div key={step.title} className="relative z-10 flex gap-4">
            <div className="flex w-8 shrink-0 justify-center pt-1">
              <Marker
                state={step.state === 'upcoming' ? 'upcoming' : 'current'}
                delay={markerDelays[index + 1]}
              />
            </div>
            <motion.div
              {...enterContent(index + 1)}
              className={cn(
                'flex min-w-0 flex-1 flex-col gap-2 pb-8',
                step.state === 'upcoming' &&
                  'text-foreground-neutral-default/50',
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-body-large-strong">{step.title}</p>
                {step.meta && (
                  <TimeBadge delay={markerDelays[index + 1] + 0.14}>
                    {step.meta}
                  </TimeBadge>
                )}
              </div>
              {step.description && (
                <p
                  className={cn(
                    'text-body-medium-default',
                    step.state === 'current' && 'text-foreground-neutral-faded',
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
        <div className="flex w-8 shrink-0 justify-center pt-2">
          <Marker state="kit" delay={markerDelays[3]} />
        </div>
        <motion.div
          {...enterContent(3)}
          className="relative flex min-w-0 flex-1 flex-col gap-2 overflow-hidden rounded-3xl p-6"
          style={{ backgroundImage: PRIMARY_WASH }}
        >
          <p className="text-title-medium-strong font-sans max-w-[min(240px,58%)]">
            Your welcome kit
          </p>
          <p className="text-body-medium-default text-foreground-neutral-default max-w-[min(240px,58%)]">
            A gift from Sword with accessories to support you during your
            program
          </p>
          <BoxImage delay={markerDelays[3] + 0.08} />
        </motion.div>
      </div>
    </div>
  );
}
