'use client';

import { ThriveLogo } from '@/design/assets/logos/thrive';
import { Button } from '@/design/components/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/design/components/tooltip';
import { mergeTailwindClasses as cn } from '@/design/utils';
import { ArrowRight, ChevronDown, Globe } from 'lucide-react';
import { useState } from 'react';

import card1 from '@/app/goncalo/image-ticker-quiz-hero/assets/card-1.png';
import card2 from '@/app/goncalo/image-ticker-quiz-hero/assets/card-2.png';
import card3 from '@/app/goncalo/image-ticker-quiz-hero/assets/card-3.png';
import card4 from '@/app/goncalo/image-ticker-quiz-hero/assets/card-4.png';

const bodyAreas = [
  ['Neck', 'Shoulder'],
  ['Elbow', 'Wrist/Hand'],
  ['Back', 'Hip'],
  ['Knee', 'Ankle/Foot'],
] as const;

const columnLeft = [card1.src, card2.src, card1.src] as const;

const columnRight = [card3.src, card4.src, card3.src] as const;

const fade =
  'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)';

export default function ImageTickerQuizHero() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="bg-background-neutral-default text-foreground-neutral-default flex min-h-screen w-full flex-col">
      <style>{`
        @keyframes ticker-up {
          from { transform: translateY(0); }
          to { transform: translateY(-50%); }
        }
        @keyframes ticker-down {
          from { transform: translateY(-50%); }
          to { transform: translateY(0); }
        }
      `}</style>

      <header className="flex h-20 w-full shrink-0 items-center justify-between px-16">
        <ThriveLogo className="h-8 w-auto" />
        <div className="flex items-center gap-6">
          <button
            type="button"
            className="text-foreground-neutral-default flex cursor-pointer items-center gap-2"
          >
            <Globe className="size-5" strokeWidth={1.5} />
            <span className="text-body-medium-strong">
              US <span className="font-normal">(EN)</span>
            </span>
            <ChevronDown className="size-3" strokeWidth={2} />
          </button>
          <div className="bg-border-neutral-default h-4 w-px" />
          <Button variant="solid" size="medium">
            Get started
          </Button>
        </div>
      </header>

      <main className="flex w-full flex-1 items-stretch gap-16 overflow-hidden px-16">
        <section className="flex w-full max-w-[560px] flex-col gap-8 py-16">
          <div className="flex flex-col gap-6">
            <h1 className="text-foreground-neutral-default text-[42px] leading-[48px] font-normal tracking-[-0.02em]">
              Get <span className="font-semibold">expert physical therapy</span>
              <br />
              from home
            </h1>
            <p className="text-body-large-default text-foreground-neutral-default">
              Sword Thrive is an AI physical therapy solution for back, joint,
              and muscle pain.
            </p>
          </div>

          <div className="bg-border-neutral-subtle h-px w-full" />

          <div className="flex flex-col gap-6">
            <h2 className="text-foreground-neutral-default text-title-medium-strong">
              What body area would you like to focus on?
            </h2>

            <div className="flex flex-col gap-3">
              {bodyAreas.map((row) => (
                <div key={row.join('-')} className="flex gap-3">
                  {row.map((label) => {
                    const isSelected = selected === label;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setSelected(label)}
                        aria-pressed={isSelected}
                        className={cn(
                          'text-body-medium-subtle flex flex-1 cursor-pointer items-center rounded-2xl border px-6 py-[18px] text-left transition-colors duration-200',
                          isSelected
                            ? 'border-background-brand-default bg-background-brand-default/10'
                            : 'bg-background-neutral-subtle text-foreground-neutral-default hover:bg-background-neutral-strong/40 border-transparent',
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {selected ? (
              <Button
                variant="solid"
                className="h-12 self-start rounded-2xl px-8"
              >
                Continue
                <ArrowRight className="size-5" strokeWidth={1.5} />
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger
                  render={<span />}
                  closeOnClick={false}
                  className="inline-flex cursor-not-allowed self-start"
                >
                  <Button
                    variant="solid"
                    disabled
                    className="pointer-events-none h-12 rounded-2xl px-8 disabled:opacity-50"
                  >
                    Continue
                    <ArrowRight className="size-5" strokeWidth={1.5} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Please select an option</TooltipContent>
              </Tooltip>
            )}
          </div>
        </section>

        <section
          className="relative min-h-[840px] flex-1 self-stretch overflow-hidden"
          style={{ maskImage: fade, WebkitMaskImage: fade }}
        >
          <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center gap-5">
            <div
              className="flex flex-col"
              style={{ animation: 'ticker-up 36s linear infinite' }}
            >
              {[...columnLeft, ...columnLeft].map((src, index) => (
                <img
                  key={`l-${index}`}
                  src={src}
                  alt=""
                  className="mb-5 block h-[320px] w-[240px] rounded-2xl object-cover shadow-[0_12px_20px_rgba(0,0,0,0.05)]"
                />
              ))}
            </div>
            <div className="pt-[120px]">
              <div
                className="flex flex-col"
                style={{ animation: 'ticker-down 36s linear infinite' }}
              >
                {[...columnRight, ...columnRight].map((src, index) => (
                  <img
                    key={`r-${index}`}
                    src={src}
                    alt=""
                    className="mb-5 block h-[320px] w-[240px] rounded-2xl object-cover shadow-[0_12px_20px_rgba(0,0,0,0.05)]"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
