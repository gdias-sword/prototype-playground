'use client';

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
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type ReactNode,
} from 'react';
import sessionFeedback from './assets/session-feedback.png';
import meshGradient from './assets/thrive-mesh-gradient-01.png';
import welcomeKit from './assets/welcome-kit.png';
import { Rise } from './celebration';
import { TherapistChat } from './therapist-chat';

const CHAT_STEP = 2;
const SESSION_STEP = 0;
const STEP_DURATIONS = [10000, 5000, 9000];

// Safari only renders alpha from HEVC, and Chromium only from VP9. Chromium
// rejects the quicktime type, so each browser lands on the file it can key.
const SESSION_CLIP_SOURCES = [
  {
    src: new URL('./assets/session-feedback.mov', import.meta.url).href,
    type: 'video/quicktime; codecs="hvc1"',
  },
  {
    src: new URL('./assets/session-feedback.webm', import.meta.url).href,
    type: 'video/webm; codecs="vp9"',
  },
];

// The clip and its poster (session-feedback.png) are both 930×960.
const SESSION_FRAME = { width: 930, height: 960 };

// Hold the clip until the panel's Rise (0.8s delay + 1s) has mostly landed,
// or until the step crossfade (0.6s) finishes on later visits.
const SESSION_START_ON_ENTRANCE = 1600;
const SESSION_START_ON_STEP = 600;

type PauseReason = 'focus' | 'hover';

type EyebrowIcon = 'bolt' | 'lock';

interface Step {
  icon: EyebrowIcon;
  eyebrow: string;
  label: string;
}

const STEPS: Step[] = [
  {
    icon: 'bolt',
    eyebrow: 'Start now · 5 min',
    label: 'Do your first session, guided in real time',
  },
  {
    icon: 'lock',
    eyebrow: 'Unlocks after your first session',
    label: 'Get your free welcome kit',
  },
  {
    icon: 'lock',
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
  paused: boolean;
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
  const [paused, setPausedState] = useState(false);

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
    setPausedState(pausedBy.current.size > 0);
  }

  return {
    active,
    paused,
    meters: [meter0, meter1, meter2],
    select,
    setPaused,
  };
}

export function OnboardingFrame({ children }: { children: ReactNode }) {
  const { active, paused, meters, select, setPaused } =
    useAutoProgress(STEP_DURATIONS);

  return (
    <OnboardingContext.Provider
      value={{ steps: STEPS, active, paused, meters, select, setPaused }}
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
    <div className="flex min-h-0 flex-1 flex-col items-center gap-4 lg:hidden">
      <Rise
        delay={0.8}
        duration={1}
        className="flex min-h-0 w-full flex-1 flex-col"
      >
        <StepVisual active={value.active} compact />
      </Rise>
      <Rise delay={1.1} duration={1} className="shrink-0">
        <StepMeters {...value} />
      </Rise>
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
        <Rise delay={0.8} duration={1} className="flex w-full flex-col">
          <StepVisual active={value.active} />
        </Rise>
        <Rise delay={1.1} duration={1} className="shrink-0">
          <StepMeters {...value} />
        </Rise>
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
  const { paused } = useOnboarding();
  const reduceMotion = useReducedMotion();
  const step = STEPS[active];
  const visual = STEP_VISUALS[active];
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
  }, []);

  const motionProps = {
    initial: reduceMotion
      ? { opacity: 0 }
      : { opacity: 0, y: 16, filter: 'blur(8px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    exit: reduceMotion
      ? { opacity: 0 }
      : { opacity: 0, y: -16, filter: 'blur(8px)' },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  };

  return (
    <div
      className={cn(
        'flex w-full flex-col lg:gap-7',
        compact ? 'min-h-0 flex-1 gap-8' : 'gap-7',
      )}
    >
      <div
        className={cn(
          'relative w-full',
          compact ? 'min-h-0 flex-1' : 'h-[min(420px,calc(100dvh-23rem))]',
        )}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={active}
            {...motionProps}
            className={cn(
              'absolute inset-0 flex justify-center',
              compact ? 'items-end' : 'items-center',
            )}
          >
            {active === CHAT_STEP ? (
              <TherapistChat
                className={compact ? 'h-[92%] max-h-[92%]' : undefined}
              />
            ) : active === SESSION_STEP ? (
              <SessionClip
                paused={paused}
                startDelay={
                  mounted.current
                    ? SESSION_START_ON_STEP
                    : SESSION_START_ON_ENTRANCE
                }
                reduceMotion={Boolean(reduceMotion)}
                compact={compact}
              />
            ) : (
              <img
                alt={visual.alt}
                src={assetSrc(visual.src)}
                draggable={false}
                className={cn(
                  'pointer-events-none w-auto max-w-full object-contain drop-shadow-[0_22px_36px_rgba(31,34,44,0.16)] select-none',
                  compact ? 'max-h-[92%]' : 'h-full max-h-full',
                )}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="relative h-24 w-full shrink-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={active}
            {...motionProps}
            className="absolute inset-0 flex items-start justify-center"
          >
            <StepCaption step={step} compact={compact} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function SessionClip({
  paused,
  startDelay,
  reduceMotion,
  compact,
}: {
  paused: boolean;
  startDelay: number;
  reduceMotion: boolean;
  compact?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const visual = STEP_VISUALS[SESSION_STEP];
  const [delay] = useState(startDelay);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduceMotion || !started) return;
    if (paused) {
      video.pause();
      return;
    }
    void video.play().catch(() => {});
  }, [paused, reduceMotion, started]);

  return (
    <div
      className={cn(
        'flex h-full w-full justify-center',
        compact ? 'items-end' : 'items-center',
      )}
      style={{ containerType: 'size' }}
    >
      <div
        className={cn(
          'relative max-w-full',
          compact && 'origin-bottom scale-105',
        )}
        style={{
          aspectRatio: `${SESSION_FRAME.width} / ${SESSION_FRAME.height}`,
          height: compact
            ? `min(92cqh, calc(100cqw * ${SESSION_FRAME.height} / ${SESSION_FRAME.width}))`
            : `min(100cqh, calc(100cqw * ${SESSION_FRAME.height} / ${SESSION_FRAME.width}))`,
        }}
      >
        {reduceMotion ? (
          <img
            alt={visual.alt}
            src={assetSrc(visual.src)}
            draggable={false}
            className="pointer-events-none block h-full w-full drop-shadow-[0_22px_36px_rgba(31,34,44,0.16)] select-none"
          />
        ) : (
          <video
            ref={videoRef}
            aria-label={visual.alt}
            muted
            playsInline
            preload="auto"
            className="pointer-events-none block h-full w-full drop-shadow-[0_22px_36px_rgba(31,34,44,0.16)] select-none"
          >
            {SESSION_CLIP_SOURCES.map((source) => (
              <source key={source.src} src={source.src} type={source.type} />
            ))}
          </video>
        )}
      </div>
    </div>
  );
}

function StepCaption({ step, compact }: { step: Step; compact?: boolean }) {
  return (
    <div className="flex max-w-[340px] flex-col items-center gap-2 text-center">
      <p className="flex items-center justify-center gap-1.5 text-[12px] leading-4 font-semibold tracking-[1.2px] text-[#0d0d0d]/55 uppercase">
        <EyebrowMark icon={step.icon} />
        {step.eyebrow}
      </p>
      <h2
        className={cn(
          'font-serif font-semibold tracking-[-0.3px] text-pretty text-[#0d0d0d]',
          compact ? 'text-[22px] leading-7' : 'text-[26px] leading-8',
        )}
      >
        {step.label}
      </h2>
    </div>
  );
}

function EyebrowMark({ icon }: { icon: EyebrowIcon }) {
  if (icon === 'bolt') {
    return (
      <svg
        width="10"
        height="12"
        viewBox="0 0 10 12"
        fill="currentColor"
        aria-hidden
        className="shrink-0"
      >
        <path d="M6 0 0 7h4l-1 5 7-7H6z" />
      </svg>
    );
  }

  return (
    <svg
      width="11"
      height="12"
      viewBox="0 0 11 12"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <rect
        x=".75"
        y="5"
        width="9.5"
        height="6.25"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M2.9 5V3.6a2.6 2.6 0 0 1 5.2 0V5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
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
