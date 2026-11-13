'use client';

import meshGradient from './assets/thrive-mesh-gradient-01.png';
import sessionFeedback from './assets/session-feedback.png';
import welcomeKit from './assets/welcome-kit.png';
import { TherapistChat } from './therapist-chat';
import { cn } from '@/design/utils';
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  type MotionValue,
} from 'motion/react';
import {
  createContext,
  useContext,
  useRef,
  useState,
  type FocusEvent,
  type ReactNode,
} from 'react';

const CHAT_STEP = 2;
const STEP_DURATIONS = [5000, 5000, 9000];

type PauseReason = 'focus' | 'hover';

interface Step {
  eyebrow: string;
  label: string;
}

const STEPS: Step[] = [
  {
    eyebrow: 'Start now · 5 min',
    label: 'Do your first session, guided in real time',
  },
  {
    eyebrow: 'Unlocks after your first session',
    label: 'Get your free welcome kit',
  },
  {
    eyebrow: 'Unlocks after your first session',
    label: 'Connect with your physical therapist',
  },
];

const STEP_VISUALS: { src: string | { src: string }; alt: string }[] = [
  {
    src: sessionFeedback,
    alt: 'A guided session on the phone, with live form cues beside the rep',
  },
  {
    src: welcomeKit,
    alt: 'The free welcome kit: a Sword phone stand beside its box',
  },
];

interface OnboardingValue {
  steps: Step[];
  active: number;
  meters: MotionValue<number>[];
  select: (index: number) => void;
  setPaused: (reason: PauseReason, paused: boolean) => void;
}

const OnboardingContext = createContext<OnboardingValue | null>(null);

function useOnboarding() {
  const value = useContext(OnboardingContext);
  if (!value) {
    throw new Error('Onboarding pieces must render inside OnboardingFrame');
  }
  return value;
}

function assetSrc(asset: string | { src: string }) {
  return typeof asset === 'string' ? asset : asset.src;
}

function useAutoProgress(durations: number[]) {
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const meter0 = useMotionValue(0);
  const meter1 = useMotionValue(0);
  const meter2 = useMotionValue(0);
  const meters = useRef([meter0, meter1, meter2]);
  const pausedBy = useRef(new Set<string>());

  function goTo(index: number) {
    meters.current.forEach((meter, step) => {
      meter.set(step < index ? 1 : 0);
    });
    activeRef.current = index;
    setActive(index);
  }

  useAnimationFrame((_, delta) => {
    if (pausedBy.current.size > 0) return;
    const step = activeRef.current;
    const next = meters.current[step].get() + delta / durations[step];
    if (next >= 1) {
      goTo((step + 1) % durations.length);
    } else {
      meters.current[step].set(next);
    }
  });

  function select(index: number) {
    goTo(index);
  }

  function setPaused(reason: PauseReason, value: boolean) {
    if (value) pausedBy.current.add(reason);
    else pausedBy.current.delete(reason);
  }

  return {
    active,
    meters: [meter0, meter1, meter2],
    select,
    setPaused,
  };
}

export function OnboardingFrame({ children }: { children: ReactNode }) {
  const { active, meters, select, setPaused } = useAutoProgress(STEP_DURATIONS);

  return (
    <OnboardingContext.Provider
      value={{ steps: STEPS, active, meters, select, setPaused }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function OnboardingWash() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 lg:hidden"
    >
      <Mesh />
    </div>
  );
}

export function OnboardingMobileStage() {
  const value = useOnboarding();

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 lg:hidden">
      <StepVisual active={value.active} compact />
      <StepMeters {...value} />
    </div>
  );
}

export function OnboardingMedia() {
  const value = useOnboarding();

  return (
    <aside
      aria-label="What happens next in the Sword app"
      className="absolute inset-y-0 right-0 z-3 hidden w-[42.66%] flex-col items-center justify-center overflow-hidden bg-linear-to-b from-white to-[#c7ddfb] px-10 py-12 lg:flex"
      onMouseEnter={() => value.setPaused('hover', true)}
      onMouseLeave={() => value.setPaused('hover', false)}
    >
      <div className="absolute inset-0 overflow-hidden">
        <Mesh />
      </div>
      <div className="relative z-1 flex w-full max-w-[420px] flex-col items-center gap-8">
        <StepVisual active={value.active} />
        <StepMeters {...value} />
      </div>
    </aside>
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
  const visual = STEP_VISUALS[active];

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
        className="flex w-full flex-col items-center gap-4 lg:gap-7"
      >
        {active === CHAT_STEP ? (
          <TherapistChat compact={compact} />
        ) : (
          <img
            alt={visual.alt}
            src={assetSrc(visual.src)}
            draggable={false}
            className={cn(
              'pointer-events-none w-auto max-w-full object-contain drop-shadow-[0_22px_36px_rgba(31,34,44,0.16)] select-none',
              compact
                ? 'h-[min(280px,32dvh)]'
                : 'h-[min(420px,calc(100dvh-23rem))]',
            )}
          />
        )}
        <StepCaption step={step} compact={compact} />
      </motion.div>
    </AnimatePresence>
  );
}

function StepCaption({ step, compact }: { step: Step; compact?: boolean }) {
  return (
    <div className="flex max-w-[340px] flex-col items-center gap-2 text-center">
      <p className="text-[12px] leading-4 font-semibold tracking-[1.2px] text-[#0d0d0d]/55 uppercase">
        {step.eyebrow}
      </p>
      <h2
        className={cn(
          'font-serif font-semibold tracking-[-0.3px] text-pretty text-[#0d0d0d]',
          compact
            ? 'text-[22px] leading-7'
            : 'text-[26px] leading-8',
        )}
      >
        {step.label}
      </h2>
    </div>
  );
}

function StepMeters({
  steps,
  active,
  meters,
  select,
  setPaused,
}: OnboardingValue) {
  return (
    <ol
      className="flex gap-2"
      onFocus={(event: FocusEvent<HTMLOListElement>) => {
        if (
          event.target instanceof Element &&
          event.target.matches(':focus-visible')
        ) {
          setPaused('focus', true);
        }
      }}
      onBlur={(event: FocusEvent<HTMLOListElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPaused('focus', false);
        }
      }}
    >
      {steps.map((step, index) => (
        <li key={step.label}>
          <button
            type="button"
            onClick={() => select(index)}
            aria-current={index === active ? 'step' : undefined}
            aria-label={`Step ${index + 1} of ${steps.length}: ${step.label}`}
            className="w-12 cursor-pointer py-2.5 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d0d0d] lg:w-14"
          >
            <span className="block h-1 overflow-hidden rounded-full bg-[#0d0d0d]/15">
              <motion.span
                aria-hidden
                className="block h-full origin-left bg-[#0d0d0d]"
                style={{ scaleX: meters[index] }}
              />
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}
