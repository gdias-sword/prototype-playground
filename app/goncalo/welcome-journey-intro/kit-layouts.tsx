'use client';

import { cn } from '@/design/utils';
import { Check } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import icClock from './assets/ic-clock.svg';
import icGift from './assets/ic-gift.svg';
import kitClosed from './assets/kit-closed.png';
import { useEnter } from './benefits';
import { assetSrc } from './shell';
import { useTuning } from './tuning';

const EASE = [0.2, 1, 0.4, 1] as const;
const KIT_GRADIENT =
  'bg-linear-to-br from-[#fbe3ea] via-[#ece5fb] to-[#d6e6fd]';

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
    title: 'Movement check‑up',
    meta: '10 min',
    description: 'Guided by real-time feedback in the Sword app.',
    state: 'upcoming',
  },
  {
    title: 'Meet your physical therapist',
    meta: 'Video call',
    description: 'They build your plan, fully covered by PepsiCo.',
    state: 'upcoming',
  },
];

function Marker({ state }: { state: StepState | 'kit' }) {
  return (
    <span
      className={cn(
        'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-white',
        state === 'done' && 'bg-[#4a89e8] text-white',
        state === 'current' && 'border-2 border-[#4a89e8]',
        state === 'upcoming' && 'border-[1.5px] border-[#e0e0e0]',
        state === 'kit' && `${KIT_GRADIENT} shadow-[0_0_0_4px_white]`,
      )}
    >
      {state === 'done' && <Check className="size-4" strokeWidth={3} />}
      {state === 'current' && (
        <span className="size-2.5 rounded-full bg-[#4a89e8]" />
      )}
      {state === 'kit' && (
        <img alt="" src={assetSrc(icGift)} className="size-5" />
      )}
    </span>
  );
}

function Meta({
  children,
  isCurrent,
}: {
  children: ReactNode;
  isCurrent?: boolean;
}) {
  return isCurrent ? (
    <span className="flex items-center gap-1.5 rounded-full bg-[#eaf2fe] px-2.5 py-1 text-[12px] leading-[18px] font-semibold tracking-[0.2px] text-[#2f5aa3]">
      <img alt="" src={assetSrc(icClock)} className="size-4" />
      {children}
    </span>
  ) : (
    <span className="text-[14px] leading-5 tracking-[0.2px] text-[#5e5e5e]">
      {children}
    </span>
  );
}

function Free({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'rounded-full bg-white px-2.5 py-1 text-[12px] leading-[18px] font-semibold tracking-[0.2px] text-[#0d0d0d] shadow-[0_2px_8px_rgba(26,38,77,0.08)]',
        className,
      )}
    >
      Free · $0 shipping
    </span>
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

/* A · The kit is the finish line of a vertical timeline. */

export function KitFinish() {
  const enter = useEnter();
  const { stepsStart, rowStagger } = useTuning();
  return (
    <div className="flex flex-col">
      {JOURNEY.map((step, index) => (
        <motion.div key={step.title} {...enter(index)} className="flex gap-4">
          <div className="flex w-8 shrink-0 flex-col items-center">
            <Marker state={step.state} />
            <span
              className={cn(
                'my-1 w-0.5 flex-1 rounded-full',
                step.state === 'done' ? 'bg-[#4a89e8]' : 'bg-[#e8e8e8]',
                index === JOURNEY.length - 1 &&
                  'bg-linear-to-b from-[#e8e8e8] to-[#be95e5]',
              )}
            />
          </div>
          <div
            className={cn(
              'flex min-w-0 flex-1 flex-col gap-1 pt-1',
              step.state === 'done' ? 'pb-5' : 'pb-6',
            )}
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
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
                <Meta isCurrent={step.state === 'current'}>{step.meta}</Meta>
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
          </div>
        </motion.div>
      ))}
      <motion.div {...enter(JOURNEY.length)} className="flex gap-4">
        <div className="flex w-8 shrink-0 justify-center pt-6">
          <Marker state="kit" />
        </div>
        <div
          className={cn(
            'relative flex min-w-0 flex-1 flex-col gap-3 rounded-3xl p-6 max-sm:pt-[132px] sm:min-h-[176px] sm:pr-[46%]',
            KIT_GRADIENT,
          )}
        >
          <span className="text-[12px] leading-[18px] font-semibold tracking-[0.6px] text-[#6b5fa8] uppercase">
            Your finish line
          </span>
          <p className="font-serif text-[24px] leading-8 tracking-[-0.3px]">
            Your welcome kit
          </p>
          <p className="text-[14px] leading-5 tracking-[0.2px] text-[#3d3d3d]">
            A welcome gift from Sword, shipped to your door.
          </p>
          <Free className="self-start" />
          <BoxImage
            delay={stepsStart + rowStagger * (JOURNEY.length + 0.5)}
            className="absolute -top-10 left-1/2 w-[64%] -translate-x-1/2 sm:top-auto sm:right-[-6%] sm:bottom-[10%] sm:left-auto sm:w-[52%] sm:translate-x-0"
          />
        </div>
      </motion.div>
    </div>
  );
}

/* B · A horizontal track whose last, biggest stop is the kit. */

export function KitTrack() {
  const enter = useEnter();
  const { stepsStart, rowStagger } = useTuning();
  return (
    <div className="flex flex-col gap-6">
      <motion.p
        {...enter(0)}
        className="text-[16px] leading-[22px] tracking-[0.2px]"
      >
        Everything here is covered by PepsiCo. Finish these steps and your kit
        ships free.
      </motion.p>
      <div className="relative grid gap-4 lg:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,1.7fr)] lg:gap-5">
        <motion.span
          aria-hidden
          className="absolute top-4 right-[20%] left-4 hidden h-0.5 origin-left rounded-full bg-linear-to-r from-[#4a89e8] via-[#e8e8e8] to-[#be95e5] lg:block"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            duration: 1.6,
            delay: stepsStart + rowStagger,
            ease: EASE,
          }}
        />
        {JOURNEY.map((step, index) => (
          <motion.div
            key={step.title}
            {...enter(index + 1)}
            className="flex gap-4 lg:flex-col lg:gap-4"
          >
            <Marker state={step.state} />
            <div className="flex min-w-0 flex-col gap-1.5 pt-1 lg:pt-0 lg:pr-2">
              <p
                className={cn(
                  'text-[16px] leading-[22px] font-semibold tracking-[0.2px]',
                  step.state === 'done' && 'text-[#5e5e5e]',
                  step.state === 'upcoming' && 'opacity-70',
                )}
              >
                {step.title}
              </p>
              {step.meta && (
                <span className="flex">
                  <Meta isCurrent={step.state === 'current'}>{step.meta}</Meta>
                </span>
              )}
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
            </div>
          </motion.div>
        ))}
        <motion.div
          {...enter(JOURNEY.length + 1)}
          className={cn(
            'relative flex min-h-[220px] flex-col justify-end gap-2 overflow-visible rounded-3xl p-5 lg:-mt-2 lg:min-h-[340px]',
            KIT_GRADIENT,
          )}
        >
          <span className="absolute top-4 left-4 flex items-center gap-2">
            <Marker state="kit" />
          </span>
          <Free className="absolute top-5 right-4" />
          <BoxImage
            delay={stepsStart + rowStagger * (JOURNEY.length + 1.5)}
            className="absolute top-[10%] left-1/2 w-[86%] -translate-x-1/2 max-lg:top-auto max-lg:right-[4%] max-lg:bottom-[14%] max-lg:left-auto max-lg:w-[44%] max-lg:translate-x-0"
          />
          <p className="relative font-serif text-[24px] leading-8 tracking-[-0.3px] max-lg:pr-[48%]">
            Your welcome kit
          </p>
          <p className="relative text-[14px] leading-5 tracking-[0.2px] text-[#3d3d3d] max-lg:pr-[48%]">
            Ships after you meet your physical therapist.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
