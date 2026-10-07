'use client';

import gradient from '@/app/goncalo/canada-pricing-interstitial/assets/gradient.svg';
import pepsiLogo from '@/app/goncalo/eligibility-check-transition/assets/pepsi.svg';
import { SwordLogo } from '@/design/assets/logos/sword';
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

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const HOLDS = [2300, 2100, 3000];

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

function SwordMark() {
  return (
    <div className="flex size-20 items-center justify-center">
      <div className="h-[70px] w-[37px] overflow-hidden">
        <SwordLogo
          variant="primary"
          className="h-[70px] w-[284.375px] max-w-none"
        />
      </div>
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

function motionFor(key: 'badge' | 'pepsi', from: Step, to: Step) {
  if (from === 0 && to === 1) {
    return key === 'badge'
      ? { duration: 720, delay: 280 }
      : { duration: 1120, delay: 70 };
  }
  if (from === 1 && to === 2) {
    return key === 'badge'
      ? { duration: 1040, delay: 60 }
      : { duration: 640, delay: 0 };
  }
  if (from === 2 && to === 0) {
    return key === 'badge'
      ? { duration: 680, delay: 0 }
      : { duration: 1000, delay: 80 };
  }
  return { duration: 980, delay: 0 };
}

export default function EligibilityCheckTransition() {
  const [step, setStep] = useState<Step>(0);
  const [playing, setPlaying] = useState(true);
  const [layoutTick, setLayoutTick] = useState(0);

  const stageRef = useRef<HTMLElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const pepsiRef = useRef<HTMLDivElement>(null);
  const readyRef = useRef(false);
  const stepRef = useRef<Step>(step);

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
      x: centerX - 19,
      y: markY + mark.height + 20,
      w: 38,
      h: 26,
      r: 13,
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
      el.getAnimations().forEach((animation) => animation.cancel());

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
    });

    readyRef.current = true;
    stepRef.current = step;
  }, [step, layoutTick]);

  useEffect(() => {
    if (!playing) return;
    const timeout = window.setTimeout(() => {
      setStep((current) => ((current + 1) % 3) as Step);
    }, HOLDS[step]);
    return () => window.clearTimeout(timeout);
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
              'transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
              step === 2
                ? 'scale-[0.42] opacity-0 blur-[6px]'
                : 'scale-100 opacity-100 blur-none',
            )}
            style={{ transitionDelay: step === 2 ? '40ms' : '180ms' }}
          >
            <SwordMark />
          </div>
        </div>

        <div className="pointer-events-none absolute top-[40%] left-1/2 w-full max-w-[560px] -translate-x-1/2 px-4 pt-16 lg:px-0">
          <p
            className={cn(
              'mx-auto max-w-[375px] text-center font-serif text-[26px] leading-8 transition-opacity duration-300 ease-out',
              step === 0 ? 'opacity-100' : 'opacity-0',
            )}
          >
            We are checking if you’re
            <br />
            eligible for Sword
          </p>
          <div
            className={cn(
              'absolute inset-x-4 top-16 text-center transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] lg:inset-x-0',
              step === 2
                ? 'translate-y-0 opacity-100'
                : 'translate-y-3 opacity-0',
            )}
            style={{ transitionDelay: step === 2 ? '180ms' : '0ms' }}
          >
            <h1 className="font-serif text-[28px] leading-[34px]">
              You are eligible
            </h1>
            <p className="mt-4 text-[16px] leading-[22px]">
              Your Sword account is now active through PepsiCo
            </p>
          </div>
        </div>

        <div
          ref={badgeRef}
          className={cn(
            'absolute top-0 left-0 box-border flex items-center justify-center border transition-[opacity,background-color,border-color] duration-500',
            step === 0 && 'opacity-0',
            step === 1 && 'border-transparent bg-[#e7f0fc] opacity-100',
            step === 2 && 'border-[#f2f2f2] bg-[rgba(74,137,232,0.1)] opacity-100',
          )}
          style={{ transitionDelay: step === 1 ? '220ms' : '0ms' }}
          aria-hidden={step === 0}
        >
          <CheckIcon />
        </div>

        <div
          ref={pepsiRef}
          className={cn(
            'absolute top-0 left-0 transition-opacity duration-500',
            step === 2 ? 'opacity-0' : 'opacity-100',
          )}
        >
          <img
            src={assetSrc(pepsiLogo)}
            alt=""
            className="size-full object-contain"
          />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-12 flex flex-col items-center gap-4">
          <p
            className={cn(
              'text-[16px] leading-[22px] transition-opacity duration-300',
              step === 0 ? 'opacity-100' : 'opacity-0',
            )}
          >
            A benefit from
          </p>
          <div ref={footerRef} className="h-12 w-[157px]" />
        </div>

        <div
          className={cn(
            'absolute inset-x-0 bottom-0 flex flex-col items-center px-4 pb-6 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] lg:pb-8',
            step === 2
              ? 'translate-y-0 opacity-100'
              : 'pointer-events-none translate-y-4 opacity-0',
          )}
          style={{ transitionDelay: step === 2 ? '220ms' : '0ms' }}
        >
          <p className="mb-4 flex items-center gap-1.5 text-[16px] leading-[22px] font-medium lg:mb-8">
            <CircleCheck />
            Sword is covered for you
          </p>
          <Button className="h-12 w-full rounded-2xl bg-[#5993EA] px-8 text-[14px] leading-[22px] font-semibold text-white hover:bg-[#4A89E8] lg:w-[180px]">
            Continue
          </Button>
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
