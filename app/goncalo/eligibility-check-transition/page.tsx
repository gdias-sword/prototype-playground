'use client';

import gradient from '@/app/goncalo/canada-pricing-interstitial/assets/gradient.svg';
import pepsiLogo from '@/app/goncalo/eligibility-check-transition/assets/pepsi.svg';
import { SwordLoader } from '@/app/goncalo/eligibility-check-transition/folding-mark';
import { ThriveLogo } from '@/design/assets/logos/thrive';
import { Button } from '@/design/components/button';
import { cn } from '@/design/utils';
import {
  Accessibility,
  ChevronDown,
  Globe,
  Menu,
  Pause,
  Play,
} from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const HOLDS = [3000, 1600, 3600];
const SOFT =
  'motion-safe:transition-[opacity,translate] motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-opacity motion-reduce:duration-150 motion-reduce:delay-0';

const STEPS = [
  { label: 'Checking' },
  { label: 'Confirmed' },
  { label: 'Eligible' },
] as const;

type Step = 0 | 1 | 2;

type Frame = {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
};

function assetSrc(asset: string | { src: string }) {
  return typeof asset === 'string' ? asset : asset.src;
}

const MARK_HEIGHT = 70;

function SwordMark({ phase }: { phase: number }) {
  return (
    <div className="flex size-20 items-center justify-center">
      <SwordLoader height={MARK_HEIGHT} phase={phase} />
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="h-1/2 w-1/2" aria-hidden>
      <path
        d="M4 16L12 24L28 8"
        stroke="#4A89E8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CircleCheck() {
  return (
    <svg viewBox="0 0 20 20" className="size-5 shrink-0" aria-hidden>
      <path
        fill="#4A89E8"
        d="M10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2ZM13.3535 7.64648C13.1583 7.45122 12.8417 7.45122 12.6465 7.64648L9 11.293L7.35352 9.64648C7.15825 9.45122 6.84175 9.45122 6.64648 9.64648C6.45122 9.84175 6.45122 10.1583 6.64648 10.3535L8.64648 12.3535C8.84175 12.5488 9.15825 12.5488 9.35352 12.3535L13.3535 8.35352C13.5488 8.15825 13.5488 7.84175 13.3535 7.64648Z"
      />
    </svg>
  );
}

function frameStyle(frame: Frame) {
  return {
    transform: `translate3d(${frame.x}px, ${frame.y}px, 0)`,
    width: `${frame.w}px`,
    height: `${frame.h}px`,
    borderRadius: `${frame.r}px`,
  };
}

function readFrame(el: HTMLElement, stage: DOMRect): Frame {
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left - stage.left,
    y: rect.top - stage.top,
    w: rect.width,
    h: rect.height,
    r: Number.parseFloat(getComputedStyle(el).borderRadius) || 0,
  };
}

function badgePresence(current: Step) {
  return { opacity: current === 0 ? 0 : 1 };
}

function motionFor(key: 'badge' | 'pepsi', from: Step, to: Step) {
  if (from === 0 && to === 1) {
    return key === 'badge'
      ? { duration: 1080, delay: 160 }
      : { duration: 1240, delay: 30 };
  }
  if (from === 1 && to === 2) {
    return key === 'badge'
      ? { duration: 1180, delay: 0 }
      : { duration: 920, delay: 70 };
  }
  if (from === 2 && to === 0) {
    return key === 'badge'
      ? { duration: 1040, delay: 0 }
      : { duration: 1240, delay: 120 };
  }
  if (from === 0 && to === 2) {
    return key === 'badge'
      ? { duration: 1160, delay: 40 }
      : { duration: 980, delay: 0 };
  }
  if (from === 2 && to === 1) {
    return key === 'badge'
      ? { duration: 1040, delay: 30 }
      : { duration: 1080, delay: 90 };
  }
  if (from === 1 && to === 0) {
    return key === 'badge'
      ? { duration: 960, delay: 0 }
      : { duration: 1160, delay: 50 };
  }
  return { duration: 1080, delay: 0 };
}

export default function EligibilityCheckTransition() {
  const [step, setStep] = useState<Step>(0);
  const [playing, setPlaying] = useState(true);
  const [layoutTick, setLayoutTick] = useState(0);
  const [phase, setPhase] = useState(0);
  const [folding, setFolding] = useState(true);

  const stageRef = useRef<HTMLElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const pepsiRef = useRef<HTMLDivElement>(null);
  const readyRef = useRef(false);
  const stepRef = useRef<Step>(step);
  const phaseRef = useRef(0);
  const elapsedRef = useRef(0);
  const prevStepRef = useRef<Step>(step);

  function publishPhase(next: number) {
    phaseRef.current = next;
    setPhase(next);
  }

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(() => {
      setLayoutTick((tick) => tick + 1);
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const stageEl = stageRef.current;
    const markEl = markRef.current;
    const footerEl = footerRef.current;
    const badgeEl = badgeRef.current;
    const pepsiEl = pepsiRef.current;
    if (!stageEl || !markEl || !footerEl || !badgeEl || !pepsiEl) return;

    const stage = stageEl.getBoundingClientRect();
    const mark = markEl.getBoundingClientRect();
    const footer = footerEl.getBoundingClientRect();
    const markX = mark.left - stage.left;
    const markY = mark.top - stage.top;
    const centerX = markX + mark.width / 2;

    const pill: Frame = {
      x: centerX - 16,
      y: markY + mark.height + 17,
      w: 32,
      h: 32,
      r: 16,
    };
    const success: Frame = {
      x: markX + (mark.width - 64) / 2,
      y: markY + (mark.height - 64) / 2,
      w: 64,
      h: 64,
      r: 32,
    };
    const docked: Frame = {
      x: centerX - 78.5,
      y: markY + mark.height + 66,
      w: 157,
      h: 48,
      r: 0,
    };
    const footerFrame: Frame = {
      x: footer.left - stage.left,
      y: footer.top - stage.top,
      w: 157,
      h: 48,
      r: 0,
    };

    const targets = {
      badge: step === 2 ? success : pill,
      pepsi:
        step === 0
          ? footerFrame
          : {
              ...docked,
              y: step === 2 ? docked.y + 14 : docked.y,
            },
    };

    const previous = stepRef.current;
    const shouldAnimate = readyRef.current && previous !== step;
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    (['badge', 'pepsi'] as const).forEach((key) => {
      const el = key === 'badge' ? badgeEl : pepsiEl;
      const to = targets[key];
      const from = readFrame(el, stage);
      el.getAnimations().forEach((animation) => {
        if (!(animation instanceof CSSTransition)) animation.cancel();
      });

      if (!readyRef.current || !shouldAnimate || reduced) {
        Object.assign(el.style, frameStyle(to));
        return;
      }

      Object.assign(el.style, frameStyle(from));
      const { duration, delay } = motionFor(key, previous, step);
      const animation = el.animate(
        [
          {
            transform: `translate3d(${from.x}px, ${from.y}px, 0)`,
            width: `${from.w}px`,
            height: `${from.h}px`,
            borderRadius: `${from.r}px`,
          },
          {
            transform: `translate3d(${to.x}px, ${to.y}px, 0)`,
            width: `${to.w}px`,
            height: `${to.h}px`,
            borderRadius: `${to.r}px`,
          },
        ],
        { duration, delay, easing: EASE, fill: 'forwards' },
      );
      const committedStep = step;
      animation.onfinish = () => {
        if (stepRef.current !== committedStep) return;
        Object.assign(el.style, frameStyle(to));
      };

      if (key === 'badge') {
        const fromPresence = badgePresence(previous);
        const toPresence = badgePresence(step);
        if (fromPresence.opacity !== toPresence.opacity) {
          const entering = previous === 0;
          el.animate(
            [
              { opacity: fromPresence.opacity },
              { opacity: toPresence.opacity },
            ],
            {
              duration: entering ? 640 : 380,
              delay: entering ? 80 : 0,
              easing: EASE,
              fill: 'both',
            },
          );
        }
      }
    });

    readyRef.current = true;
    stepRef.current = step;
  }, [step, layoutTick]);

  useEffect(() => {
    const enteredChecking = prevStepRef.current !== 0 && step === 0;
    prevStepRef.current = step;
    if (enteredChecking) {
      elapsedRef.current = 0;
      publishPhase(0);
    }

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    let frame = 0;
    let timeout = 0;
    let cancelled = false;

    if (step === 0) {
      setFolding(true);
      if (reduce) {
        publishPhase(0);
        elapsedRef.current = 0;
        if (!playing) return;
        timeout = window.setTimeout(() => {
          setFolding(false);
          setStep(1);
        }, HOLDS[0]);
        return () => window.clearTimeout(timeout);
      }
      if (!playing) return;

      const origin = performance.now() - elapsedRef.current;
      const tick = (now: number) => {
        if (cancelled) return;
        const elapsed = now - origin;
        if (elapsed >= HOLDS[0]) {
          elapsedRef.current = 0;
          publishPhase(0);
          setFolding(false);
          setStep(1);
          return;
        }
        elapsedRef.current = elapsed;
        publishPhase(elapsed / HOLDS[0]);
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      return () => {
        cancelled = true;
        cancelAnimationFrame(frame);
        elapsedRef.current = Math.min(
          HOLDS[0],
          Math.max(0, performance.now() - origin),
        );
      };
    }

    elapsedRef.current = 0;
    const start = phaseRef.current;
    const distance = (1 - start) % 1;
    if (reduce || distance < 0.004) {
      publishPhase(0);
      setFolding(false);
    } else {
      setFolding(true);
      const ms = Math.min(420, distance * HOLDS[0]);
      const t0 = performance.now();
      const tick = (now: number) => {
        if (cancelled) return;
        const t = Math.min(1, (now - t0) / ms);
        if (t >= 1) {
          publishPhase(0);
          setFolding(false);
          return;
        }
        publishPhase((start + distance * t) % 1);
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }

    if (playing) {
      timeout = window.setTimeout(() => {
        setStep((current) => ((current + 1) % 3) as Step);
      }, HOLDS[step]);
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [playing, step]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      setPlaying(false);
      setStep((current) => {
        const next = event.key === 'ArrowRight' ? current + 1 : current - 1;
        return ((next + 3) % 3) as Step;
      });
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-white text-[#0d0d0d]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[#f2f2f2]"
      >
        <div className="absolute inset-0 bg-linear-to-b from-white from-12% via-white via-24% to-transparent to-40%" />
        <div className="absolute bottom-[-2400px] left-1/2 ml-4 size-[2400px] -translate-x-1/2">
          <img
            src={assetSrc(gradient)}
            alt=""
            className="absolute inset-[-10.93%] h-[calc(100%+21.86%)] w-[calc(100%+21.86%)] max-w-none"
          />
        </div>
      </div>

      <header className="relative z-20 flex h-16 shrink-0 items-center justify-between px-4 lg:h-20 lg:px-16">
        <div className="flex items-center gap-4">
          <img
            src={assetSrc(pepsiLogo)}
            alt="PepsiCo"
            className="h-8 w-[105px] object-contain"
          />
          <div className="h-6 w-px bg-[#dbdbdb]" />
          <ThriveLogo className="h-[30px] w-auto text-[#1f222c]" />
        </div>
        <div className="hidden items-center gap-6 lg:flex">
          <button
            type="button"
            className="flex items-center gap-2 text-[14px] leading-5"
          >
            <Globe className="size-6" strokeWidth={1.5} />
            <span className="font-semibold">
              US <span className="font-normal">(EN)</span>
            </span>
            <ChevronDown className="size-4" strokeWidth={2} />
          </button>
          <button type="button" aria-label="Accessibility" className="p-1">
            <Accessibility className="size-6" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            className="flex items-center gap-2 text-[14px] leading-5 font-semibold"
          >
            Member Name
            <ChevronDown className="size-5" strokeWidth={2} />
          </button>
        </div>
        <button type="button" className="p-2 lg:hidden" aria-label="Menu">
          <Menu className="size-6" strokeWidth={1.75} />
        </button>
      </header>

      <main ref={stageRef} className="relative z-10 min-h-0 flex-1">
        <div
          ref={markRef}
          className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <div
            className={cn(
              SOFT,
              step === 2
                ? 'opacity-0 motion-safe:duration-[720ms] motion-safe:delay-100'
                : 'opacity-100 motion-safe:duration-[820ms] motion-safe:delay-[280ms]',
            )}
          >
            <SwordMark phase={phase} />
          </div>
        </div>

        <div className="pointer-events-none absolute top-[40%] left-1/2 w-full max-w-[560px] -translate-x-1/2 px-4 pt-16 lg:px-0">
          <p
            className={cn(
              SOFT,
              'mx-auto max-w-[375px] text-center font-serif text-[26px] leading-8',
              step === 0
                ? 'translate-y-0 opacity-100 motion-safe:duration-[820ms] motion-safe:delay-[320ms]'
                : '-translate-y-2 opacity-0 motion-safe:duration-[640ms] motion-safe:delay-0',
            )}
          >
            We are checking if you’re
            <br />
            eligible for Sword
          </p>
          <div className="absolute inset-x-4 top-16 text-center lg:inset-x-0">
            <h1
              className={cn(
                SOFT,
                'font-serif text-[28px] leading-[34px]',
                step === 2
                  ? 'translate-y-0 opacity-100 motion-safe:duration-[900ms] motion-safe:delay-[160ms]'
                  : 'translate-y-3 opacity-0 motion-safe:duration-[480ms] motion-safe:delay-0',
              )}
            >
              You are eligible
            </h1>
            <p
              className={cn(
                SOFT,
                'mt-4 text-[16px] leading-[22px]',
                step === 2
                  ? 'translate-y-0 opacity-100 motion-safe:duration-[900ms] motion-safe:delay-[160ms]'
                  : 'translate-y-2 opacity-0 motion-safe:duration-[420ms] motion-safe:delay-0',
              )}
            >
              Your Sword account is now active through PepsiCo
            </p>
          </div>
        </div>

        <div
          ref={badgeRef}
          className={cn(
            'absolute top-0 left-0 box-border flex items-center justify-center border motion-safe:transition-[background-color,border-color] motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:duration-150',
            step === 0 ? 'opacity-0' : 'opacity-100',
            step === 2
              ? 'border-[#f2f2f2] bg-[rgba(74,137,232,0.1)] motion-safe:duration-[1100ms]'
              : 'border-transparent bg-[#e7f0fc] motion-safe:duration-[420ms]',
          )}
          aria-hidden={step === 0}
        >
          <CheckIcon />
        </div>

        <div ref={pepsiRef} className="absolute top-0 left-0">
          <img
            src={assetSrc(pepsiLogo)}
            alt=""
            className={cn(
              'size-full object-contain',
              SOFT,
              step === 2
                ? 'opacity-0 motion-safe:duration-[720ms] motion-safe:delay-100'
                : 'opacity-100 motion-safe:duration-[820ms] motion-safe:delay-[280ms]',
            )}
          />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-12 flex flex-col items-center gap-4">
          <p
            className={cn(
              SOFT,
              'text-[16px] leading-[22px]',
              step === 0
                ? 'translate-y-0 opacity-100 motion-safe:duration-[760ms] motion-safe:delay-[420ms]'
                : 'translate-y-1.5 opacity-0 motion-safe:duration-[480ms] motion-safe:delay-[50ms]',
            )}
          >
            A benefit from
          </p>
          <div ref={footerRef} className="h-12 w-[157px]" />
        </div>

        <div
          className={cn(
            'absolute inset-x-0 bottom-0 flex flex-col items-center px-4 pb-6 lg:pb-8',
            step === 2 ? '' : 'pointer-events-none',
          )}
        >
          <p
            className={cn(
              SOFT,
              'mb-4 flex items-center gap-1.5 text-[16px] leading-[22px] font-medium lg:mb-8',
              step === 2
                ? 'translate-y-0 opacity-100 motion-safe:duration-[900ms] motion-safe:delay-[420ms]'
                : 'translate-y-3 opacity-0 motion-safe:duration-[420ms] motion-safe:delay-0',
            )}
          >
            <CircleCheck />
            Sword is covered for you
          </p>
          <div
            className={cn(
              SOFT,
              'w-full lg:w-auto',
              step === 2
                ? 'translate-y-0 opacity-100 motion-safe:duration-[900ms] motion-safe:delay-[420ms]'
                : 'translate-y-4 opacity-0 motion-safe:duration-[400ms] motion-safe:delay-0',
            )}
          >
            <Button className="h-12 w-full rounded-2xl bg-[#5993EA] px-8 text-[14px] leading-[22px] font-semibold text-white hover:bg-[#4A89E8] lg:w-[180px]">
              Continue
            </Button>
          </div>
        </div>

        <div className="absolute top-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white/80 p-1 shadow-[0_8px_30px_rgba(31,34,44,0.08)] backdrop-blur-md">
          <button
            type="button"
            onClick={() => setPlaying((value) => !value)}
            className="flex size-8 items-center justify-center rounded-full text-[#1f222c] hover:bg-[#f2f2f2]"
            aria-label={playing ? 'Pause sequence' : 'Play sequence'}
          >
            {playing ? (
              <Pause className="size-3.5" fill="currentColor" strokeWidth={0} />
            ) : (
              <Play className="size-3.5" fill="currentColor" strokeWidth={0} />
            )}
          </button>
          {STEPS.map((item, index) => {
            const active = step === index;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setPlaying(false);
                  setStep(index as Step);
                }}
                className={cn(
                  'rounded-full px-3 py-1.5 text-[13px] leading-5 transition-colors',
                  active
                    ? 'bg-[#1f222c] font-semibold text-white'
                    : 'text-[#1f222c] hover:bg-[#f2f2f2]',
                )}
                aria-pressed={active}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <p className="sr-only" aria-live="polite">
          {step === 0
            ? 'Checking if you are eligible for Sword'
            : step === 1
              ? 'Eligibility confirmed with PepsiCo'
              : 'You are eligible. Your Sword account is now active through PepsiCo'}
        </p>
      </main>
    </div>
  );
}
