'use client';

import connectPt from './assets/connect-pt.png';
import meshGradient from './assets/thrive-mesh-gradient-01.png';
import sessionFeedback from './assets/session-feedback.png';
import welcomeKit from './assets/welcome-kit.png';
import { cn } from '@/design/utils';
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from 'motion/react';
import {
  createContext,
  useContext,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';
import {
  JourneyRail,
  NumberedCapsule,
  SlidingUnderline,
  SteadyPill,
  StoryLines,
  VerticalTimeline,
  type Step,
  type StepperProps,
  type TimelineKind,
} from './steppers';

const STEP_DURATION = 5000;

type PauseReason = 'focus';

const STEPS: Step[] = [
  { label: 'Do your sessions, guided in real time' },
  { label: 'Unlock your free welcome kit' },
  { label: 'Connect with your Physical Therapist' },
];

const STEP_VISUALS: {
  src: string | { src: string };
  alt: string;
  frameClass: string;
  mobileClass: string;
}[] = [
  {
    src: sessionFeedback,
    alt: 'A guided session on the phone, with live form cues beside the rep',
    frameClass:
      'h-[min(580px,calc(100dvh-20rem))] w-auto max-w-[calc(42.66vw-3rem)] object-contain',
    mobileClass: 'h-full w-auto max-w-none',
  },
  {
    src: welcomeKit,
    alt: 'The free welcome kit: a Sword phone stand beside its box',
    frameClass:
      'h-[min(580px,calc(100dvh-20rem))] w-auto max-w-[calc(42.66vw-3rem)] object-contain',
    mobileClass: 'h-full w-auto max-w-none',
  },
  {
    src: connectPt,
    alt: 'Your physical therapist, with other therapists nearby',
    frameClass:
      'h-auto w-[min(620px,calc(42.66vw-2rem))] max-h-[min(520px,calc(100dvh-22rem))] object-contain',
    mobileClass: 'h-[88%] w-auto max-w-none',
  },
];

const STEPPERS = {
  A: StoryLines,
  B: SlidingUnderline,
  C: JourneyRail,
  D: NumberedCapsule,
  E: SteadyPill,
} as const;

type VariantId = keyof typeof STEPPERS;

const TIMELINE_KIND: Record<VariantId, TimelineKind> = {
  A: 'meters',
  B: 'underline',
  C: 'rail',
  D: 'numbered',
  E: 'numbered',
};

interface OnboardingValue {
  steps: Step[];
  active: number;
  progress: ReturnType<typeof useAutoProgress>['progress'];
  journey: ReturnType<typeof useAutoProgress>['journey'];
  meters: ReturnType<typeof useAutoProgress>['meters'];
  select: (index: number) => void;
  setPaused: (reason: PauseReason, paused: boolean) => void;
  stepper: ComponentType<StepperProps>;
  timeline: TimelineKind;
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

function journeyFor(step: number, value: number, count: number) {
  if (count < 2 || step >= count - 1) return 1;
  return (step + value) / (count - 1);
}

function useAutoProgress(count: number, duration: number) {
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const progress = useMotionValue(0);
  const journey = useMotionValue(0);
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
    progress.set(0);
    journey.set(journeyFor(index, 0, count));
    setActive(index);
  }

  useAnimationFrame((_, delta) => {
    if (pausedBy.current.size > 0) return;
    const step = activeRef.current;
    const next = progress.get() + delta / duration;
    if (next >= 1) {
      goTo((step + 1) % count);
    } else {
      progress.set(next);
      meters.current[step]?.set(next);
      journey.set(journeyFor(step, next, count));
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
    progress,
    journey,
    meters: [meter0, meter1, meter2],
    select,
    setPaused,
  };
}

function stepperProps(value: OnboardingValue): StepperProps {
  return {
    steps: value.steps,
    active: value.active,
    progress: value.progress,
    journey: value.journey,
    meters: value.meters,
    onSelect: value.select,
    onPauseChange: value.setPaused,
  };
}

export function OnboardingFrame({
  variant,
  children,
}: {
  variant: string;
  children: ReactNode;
}) {
  const id = (variant in STEPPERS ? variant : 'D') as VariantId;
  const { active, progress, journey, meters, select, setPaused } =
    useAutoProgress(STEPS.length, STEP_DURATION);

  return (
    <OnboardingContext.Provider
      value={{
        steps: STEPS,
        active,
        progress,
        journey,
        meters,
        select,
        setPaused,
        stepper: STEPPERS[id],
        timeline: TIMELINE_KIND[id],
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function OnboardingMedia() {
  const value = useOnboarding();
  const Stepper = value.stepper;

  return (
    <>
      <section
        aria-label="What happens next in the Sword app"
        className="relative z-3 h-[280px] w-full shrink-0 overflow-clip rounded-b-[48px] bg-linear-to-b from-white to-[#c7ddfb] lg:hidden"
      >
        <Mesh />
        <div className="absolute inset-0">
          <StepVisual active={value.active} compact />
        </div>
      </section>
      <aside
        aria-label="What happens next in the Sword app"
        className="absolute inset-y-0 right-0 z-3 hidden w-[42.66%] overflow-visible bg-linear-to-b from-white to-[#c7ddfb] lg:block"
      >
        <div className="absolute inset-0 overflow-hidden">
          <Mesh />
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-[calc(50%+2.5rem)] z-1 flex -translate-y-1/2 items-center justify-center">
          <StepVisual active={value.active} />
        </div>
        <Stepper
          {...stepperProps(value)}
          className={
            Stepper === NumberedCapsule || Stepper === SteadyPill
              ? 'bottom-12 left-1/2 z-2 -translate-x-1/2'
              : 'right-10 bottom-12 left-10 z-2'
          }
        />
      </aside>
    </>
  );
}

export function OnboardingSteps() {
  const value = useOnboarding();

  return (
    <VerticalTimeline
      {...stepperProps(value)}
      kind={value.timeline}
      className="w-full lg:hidden"
    />
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
        className={
          compact
            ? 'absolute inset-0'
            : 'flex items-center justify-center'
        }
      >
        <img
          alt={visual.alt}
          src={assetSrc(visual.src)}
          draggable={false}
          className={cn(
            'pointer-events-none drop-shadow-[0_22px_36px_rgba(31,34,44,0.16)] select-none',
            compact
              ? cn(
                  'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
                  visual.mobileClass,
                )
              : visual.frameClass,
          )}
        />
      </motion.div>
    </AnimatePresence>
  );
}
