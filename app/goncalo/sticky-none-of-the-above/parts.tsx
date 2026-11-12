'use client';

import icAccessibility from '@/app/goncalo/thrive-summary-app-download/assets/ic-accessibility.svg';
import icChevronDown16 from '@/app/goncalo/thrive-summary-app-download/assets/ic-chevron-down-16.svg';
import icChevronDown20 from '@/app/goncalo/thrive-summary-app-download/assets/ic-chevron-down-20.svg';
import icWorld from '@/app/goncalo/thrive-summary-app-download/assets/ic-world.svg';
import pageGradient from '@/app/goncalo/thrive-summary-app-download/assets/page-gradient.svg';
import { SwordLogo } from '@/design/assets/logos/sword';
import { Button } from '@/design/components/button';
import { cn } from '@/design/utils';
import { ArrowLeft } from 'lucide-react';
import {
  useEffect,
  useId,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';

export const FLAGS = [
  'I’m pregnant',
  'I’m seeking help to recover from a surgery that happened less than 3 months ago',
  'A health condition (cardiac, respiratory, neurological, immune) that may limit light to moderate exercise',
  'I’ve had 2 or more unexplained falls in the past 12 months',
  'I need help or a device (like a cane, walker, or crutches) to stand or walk',
  'I use an artificial limb or prosthesis',
  'I have a cancer diagnosis',
  'My pain started after a serious injury, fracture, or accident',
  'Since my pain started, I’ve had fever, chills, or redness/swelling at the site',
  'I’ve had a new, sudden change in bowel or bladder control in the past 2 weeks',
  'I’ve had new, rapid loss of strength or feeling in my arms or legs in the past 2 weeks',
] as const;

export const NONE_LABEL = 'None of these apply to me';

export const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';

const PROGRESS = [1, 1, 0.5, 0, 0, 0];

function assetSrc(asset: string | { src: string }) {
  return typeof asset === 'string' ? asset : asset.src;
}

export function useAnswers() {
  const [flags, setFlags] = useState<ReadonlySet<number>>(() => new Set());
  const [none, setNone] = useState(false);

  function toggleFlag(index: number) {
    setNone(false);
    setFlags((previous) => {
      const next = new Set(previous);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function toggleNone() {
    setFlags(new Set());
    setNone((value) => !value);
  }

  return {
    flags,
    none,
    toggleFlag,
    toggleNone,
    canContinue: none || flags.size > 0,
  };
}

export function useHeight(ref: RefObject<HTMLElement | null>) {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setHeight(entry.borderBoxSize[0]?.blockSize ?? el.offsetHeight);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return height;
}

export function Backdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none overflow-hidden bg-white', className)}
    >
      <div className="absolute bottom-[-1840px] left-1/2 size-[2000px] -translate-x-1/2">
        <img
          alt=""
          src={assetSrc(pageGradient)}
          className="absolute top-[-12%] left-[-12%] block max-w-none"
        />
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="relative z-4 flex h-16 shrink-0 items-center gap-6 px-4 lg:h-20 lg:gap-12 lg:px-16">
      <SwordLogo className="h-6 w-[97px] shrink-0" />
      <div className="flex-1" />
      <div className="flex items-center gap-4 text-[14px] leading-5 font-semibold tracking-[0.2px] lg:gap-6">
        <button
          type="button"
          className="flex cursor-pointer items-center gap-2"
        >
          <img alt="" src={assetSrc(icWorld)} />
          <span className="flex items-center gap-1">
            <span>
              US <span className="font-normal">(EN)</span>
            </span>
            <img alt="" src={assetSrc(icChevronDown16)} />
          </span>
        </button>
        <button
          type="button"
          aria-label="Accessibility"
          className="flex size-6 cursor-pointer items-center justify-center"
        >
          <img alt="" src={assetSrc(icAccessibility)} />
        </button>
        <button
          type="button"
          className="flex h-10 cursor-pointer items-center gap-2 rounded-xl text-[#1f222c]"
        >
          Member Name
          <img alt="" src={assetSrc(icChevronDown20)} />
        </button>
      </div>
    </header>
  );
}

function Progress() {
  return (
    <div
      role="progressbar"
      aria-label="Onboarding progress"
      aria-valuemin={0}
      aria-valuemax={PROGRESS.length}
      aria-valuenow={2.5}
      className="flex gap-1"
    >
      {PROGRESS.map((fill, index) => (
        <div
          key={index}
          className="h-1 flex-1 overflow-hidden rounded-full bg-[#dbdbdb]"
        >
          <div
            className="h-full rounded-full bg-[#4a89e8]"
            style={{ width: `${fill * 100}%` }}
          />
        </div>
      ))}
    </div>
  );
}

export function OptionCard({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className={cn(
        'w-full cursor-pointer rounded-2xl border px-4 py-5 text-left text-[14px] leading-5 font-medium text-[#0d0d0d] transition-colors duration-150 outline-none',
        'focus-visible:ring-2 focus-visible:ring-[#4a89e8] focus-visible:ring-offset-2',
        checked
          ? 'border-[#4a89e8] bg-[#e0ecfd]'
          : 'border-[#c2c2c2] bg-white hover:border-[#8f8f8f]',
      )}
    >
      {label}
    </button>
  );
}

export function GlassSurface({ height }: { height: string }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 bottom-0 z-10 border-t border-white bg-linear-to-b from-white/64 to-white/80 backdrop-blur-[3px] motion-safe:transition-[height] motion-safe:duration-300"
      style={{ height, transitionTimingFunction: EASE_OUT }}
    />
  );
}

export function Screen({
  footerRef,
  canContinue,
  label,
  surface,
  children,
}: {
  footerRef: RefObject<HTMLDivElement | null>;
  canContinue: boolean;
  label?: string;
  surface: ReactNode;
  children: (labelId: string) => ReactNode;
}) {
  const labelId = useId();
  const footerHeight = useHeight(footerRef);
  const style = footerHeight
    ? ({ '--footer-h': `${footerHeight}px` } as CSSProperties)
    : undefined;

  return (
    <div
      className="relative isolate min-h-dvh text-[#0d0d0d] [--footer-h:80px] [--footer-pad:16px] lg:[--footer-h:112px] lg:[--footer-pad:32px]"
      style={style}
    >
      <Backdrop className="fixed inset-x-0 bottom-0 -z-10 h-dvh" />
      <Header />

      <main className="mx-auto w-full max-w-[592px] px-4 pt-4 pb-[calc(var(--footer-h)+32px)] lg:pt-8">
        <Progress />
        <div className="mt-8 flex flex-col gap-4">
          <h1 className="font-serif text-[26px] leading-8">
            Do any of these apply to you?
          </h1>
          <p className="text-[16px] leading-[22px]">
            This helps us understand if anything needs to be considered as we
            put your program together.
          </p>
        </div>

        <section className="mt-10 flex flex-col gap-6">
          {label && (
            <p
              id={labelId}
              className="text-[16px] leading-[22px] font-semibold text-[#2e2e2e]"
            >
              {label}
            </p>
          )}
          {children(labelId)}
        </section>
      </main>

      {surface}

      <div
        ref={footerRef}
        className="fixed inset-x-0 bottom-0 z-30 flex justify-center gap-3 px-4 pt-(--footer-pad) pb-[max(var(--footer-pad),env(safe-area-inset-bottom))] lg:gap-4"
      >
        <Button
          aria-label="Previous"
          className="size-12 rounded-full bg-[#ebebeb] p-0 text-[#0d0d0d] hover:bg-[#e0e0e0] lg:hidden"
        >
          <ArrowLeft className="size-5" strokeWidth={1.75} />
        </Button>
        <Button className="hidden h-12 w-[180px] rounded-2xl bg-[#ebebeb] px-8 text-[14px] leading-5 font-semibold text-[#0d0d0d] hover:bg-[#e0e0e0] lg:inline-flex">
          Previous
        </Button>
        <Button
          disabled={!canContinue}
          className="h-12 flex-1 rounded-2xl bg-[#4a89e8] px-8 text-[14px] leading-5 font-semibold text-white hover:bg-[#3f7bd6] disabled:cursor-not-allowed disabled:bg-[#a5c4f3] lg:w-[180px] lg:flex-none"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
