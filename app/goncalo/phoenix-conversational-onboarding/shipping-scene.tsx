'use client';

import { Button } from '@/design/components/button';
import { ChevronDown } from 'lucide-react';
import { HomeIndicator, StatusBar } from './device-frame';
import { GlassField } from './glass';
import { WorldBackdrop } from './world-scene';

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-body-medium-strong text-foreground-neutral-strong">
        {label}
      </span>
      <GlassField placeholder={placeholder} />
    </label>
  );
}

export function ShippingScene() {
  return (
    <div className="bg-background-neutral-default relative flex h-full flex-col overflow-hidden">
      <WorldBackdrop />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <StatusBar />
        <div className="flex min-h-0 flex-1 flex-col px-4 pt-7">
          <h1 className="text-foreground-neutral-default max-w-[320px] font-serif text-[28px] leading-9 font-semibold tracking-[-0.03em]">
            Where should we send your reward?
          </h1>
          <div className="mt-7 flex flex-col gap-4">
            <Field label="Address" placeholder="Street address" />
            <Field label="City" placeholder="City" />
            <label className="flex flex-col gap-2">
              <span className="text-body-medium-strong text-foreground-neutral-strong">
                Country
              </span>
              <button
                type="button"
                className="text-body-large-default text-foreground-neutral-faded flex h-[52px] w-full items-center justify-between rounded-full border border-white/70 bg-white/55 px-5 shadow-[0_8px_32px_rgba(80,70,140,0.08)] backdrop-blur-xl"
              >
                Choose
                <ChevronDown className="size-4" />
              </button>
            </label>
            <Field label="Postal code" placeholder="ZIP code" />
          </div>
          <div className="mt-auto pb-2">
            <Button
              variant="solid"
              size="large"
              className="bg-background-neutral-inverse hover:bg-background-neutral-inverse/90 h-12 w-full rounded-2xl"
            >
              Continue
            </Button>
          </div>
        </div>
        <HomeIndicator />
      </div>
    </div>
  );
}
