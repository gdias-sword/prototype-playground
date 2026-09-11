'use client';

import gradient from '@/app/goncalo/canada-pricing-interstitial/assets/gradient.svg';
import { AnimatedPrice } from '@/app/goncalo/canada-pricing-interstitial/motion/animated-price';
import { SwordLogo } from '@/design/assets/logos/sword';
import { Button } from '@/design/components/button';
import { cn } from '@/design/utils';
import { ChevronDown, Globe } from 'lucide-react';
import { useState } from 'react';

const COVERAGE_OPTIONS = [80, 50, 0] as const;

type Coverage = (typeof COVERAGE_OPTIONS)[number];

const BASE_PRICES = {
  assessment: 130,
  session: 35,
  ongoing: 0,
} as const;

function priceAfterCoverage(base: number, coverage: Coverage) {
  return base * (1 - coverage / 100);
}

const TIMELINE = [
  {
    label: 'Day 1',
    title: 'Initial assessment',
    description: 'Onboarding call with your physiotherapist',
    basePrice: BASE_PRICES.assessment,
  },
  {
    label: 'Week 1–6',
    title: 'Therapy sessions',
    description: 'At your own pace, billed as you go',
    basePrice: BASE_PRICES.session,
  },
  {
    label: 'Week 6+',
    title: 'Ongoing care',
    description: 'Unlimited sessions, up to 1 year',
    basePrice: BASE_PRICES.ongoing,
  },
] as const;

function CoverageSelector({
  selected,
  onSelect,
}: {
  selected: Coverage;
  onSelect: (coverage: Coverage) => void;
}) {
  return (
    <div className="flex w-full max-w-[560px] flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-6">
      <p className="text-[14px] leading-5 font-medium whitespace-nowrap">
        Your insurer coverage
      </p>
      <div className="flex gap-2">
        {COVERAGE_OPTIONS.map((option) => {
          const isSelected = selected === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              className={cn(
                'flex h-8 min-w-16 cursor-pointer items-center justify-center rounded-full px-2 text-[16px] leading-[22px] font-medium transition-colors duration-200',
                isSelected
                  ? 'bg-[#0d0d0d] text-white'
                  : 'bg-white text-[#0d0d0d]',
              )}
              aria-pressed={isSelected}
            >
              {option}%
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TimelineRow({
  label,
  title,
  description,
  price,
  showConnector,
}: {
  label: string;
  title: string;
  description: string;
  price: number;
  showConnector: boolean;
}) {
  return (
    <div className="flex w-full flex-col">
      {showConnector ? (
        <div className="flex pl-10">
          <div className="h-6 w-px bg-[#c2c2c2]" />
        </div>
      ) : null}
      <div className="flex items-center gap-4">
        <div className="flex w-[88px] shrink-0 items-center justify-center rounded-full border border-[#dbdbdb] bg-[#e8e8e8] px-3 py-1">
          <span className="text-[14px] leading-5 font-semibold whitespace-nowrap">
            {label}
          </span>
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[16px] leading-[22px] font-medium text-[#2e2e2e]">
              {title}
            </p>
            <p className="text-[14px] leading-5 text-[#5e5e5e]">
              {description}
            </p>
          </div>
          <AnimatedPrice
            value={price}
            className="shrink-0 text-[24px] leading-[30px] font-semibold text-[#2e2e2e]"
          />
        </div>
      </div>
    </div>
  );
}

export default function CanadaPricingInterstitial() {
  const [coverage, setCoverage] = useState<Coverage>(80);

  const sessionPrice = priceAfterCoverage(BASE_PRICES.session, coverage);

  return (
    <div className="relative flex min-h-dvh w-full min-w-0 flex-1 flex-col overflow-hidden bg-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-[#f2f2f2]"
      >
        <div className="absolute inset-0 bg-linear-to-b from-white from-12% via-white via-24% to-transparent to-40%" />
        <div className="absolute bottom-[-2400px] left-1/2 ml-4 size-[2400px] -translate-x-1/2">
          <img
            src={typeof gradient === 'string' ? gradient : gradient.src}
            alt=""
            className="absolute inset-[-10.93%] h-[calc(100%+21.86%)] w-[calc(100%+21.86%)] max-w-none"
          />
        </div>
      </div>

      <header className="relative z-10 mx-auto flex h-[84px] w-full max-w-[1280px] shrink-0 items-center justify-between px-4 py-5 sm:px-8 lg:px-16">
        <SwordLogo className="h-6 w-auto" />
        <div className="flex items-center gap-4 sm:gap-8">
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 text-[#0d0d0d]"
          >
            <Globe className="size-5" strokeWidth={1.5} />
            <span className="text-[14px] leading-5 font-semibold">
              US <span className="font-normal">(EN)</span>
            </span>
            <ChevronDown className="size-3" strokeWidth={2} />
          </button>
          <div className="hidden h-4 w-px bg-[#dbdbdb] sm:block" />
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 text-[14px] leading-5 font-semibold"
          >
            Member Name
            <ChevronDown className="size-4" strokeWidth={2} />
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-1 flex-col items-center px-4 pb-8 lg:px-16">
        <section className="flex w-full max-w-[560px] flex-col items-center gap-4 pt-8 pb-10 text-center">
          <h1 className="text-display-medium-strong w-full font-semibold tracking-normal text-[#0d0d0d]">
            Here&apos;s what you can expect
          </h1>
          <p className="w-full max-w-[640px] text-[16px] leading-[22px] font-medium text-[#1e1e1e]">
            No upfront cost. You&apos;re billed only for sessions you complete.
          </p>
        </section>

        <section className="flex w-full max-w-[560px] flex-col items-center gap-8">
          <div className="flex items-end justify-center gap-2">
            <AnimatedPrice
              value={sessionPrice}
              className="text-display-large-strong font-semibold text-[#0d0d0d]"
            />
            <span className="pb-2 text-[16px] leading-[22px] text-[#0d0d0d]">
              / session
            </span>
          </div>

          <CoverageSelector selected={coverage} onSelect={setCoverage} />
        </section>

        <section className="flex w-full max-w-[480px] flex-col gap-1 pt-10">
          {TIMELINE.map((item, index) => (
            <TimelineRow
              key={item.label}
              label={item.label}
              title={item.title}
              description={item.description}
              price={priceAfterCoverage(item.basePrice, coverage)}
              showConnector={index > 0}
            />
          ))}
        </section>

        <div className="mt-auto flex w-full max-w-[560px] flex-col items-center gap-6 pt-4 pb-8">
          <p className="text-center text-[14px] leading-5 text-[#5e5e5e]">
            Estimate based on 3 sessions per week. Actual cost depends on your
            usage.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              variant="ghost"
              size="large"
              className="h-12 w-[180px] rounded-2xl bg-[#e8e8e8] text-[14px] leading-5 font-semibold text-[#0d0d0d] hover:bg-[#dbdbdb]"
            >
              Previous
            </Button>
            <Button
              size="large"
              className="h-12 rounded-2xl bg-[#4a89e8] px-8 text-[14px] leading-5 font-semibold hover:bg-[#3d7ad4]"
            >
              Good, let&apos;s continue
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
