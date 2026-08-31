'use client';

import { Button } from '@/design/components/button';
import { Input } from '@/design/components/input';
import { ChevronDown } from 'lucide-react';
import shippingMesh from './assets/reward-shipping-mesh.png';
import { HomeIndicatorSpace, StatusBar } from './device-frame';

function assetSrc(asset: string | { src: string }) {
  return typeof asset === 'string' ? asset : asset.src;
}

export function RewardShippingScene({
  onSubmit,
}: {
  onSubmit: () => void;
}) {
  return (
    <div className="bg-background-neutral-default absolute inset-0 flex flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[612px] opacity-40">
        <img
          alt=""
          aria-hidden
          src={assetSrc(shippingMesh)}
          className="size-full object-cover object-bottom"
        />
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <StatusBar />
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-8 pb-4">
          <h1 className="text-title-large-strong text-foreground-neutral-default max-w-[320px] font-serif font-medium tracking-[-0.04em]">
            Where should we send your reward?
          </h1>

          <div className="mt-8 flex flex-col gap-4">
            <Input label="Address" placeholder="Street address" />
            <Input label="City" placeholder="City" />
            <label className="flex flex-col gap-2">
              <span className="text-body-medium-strong text-foreground-neutral-default">
                Country
              </span>
              <button
                type="button"
                className="border-border-neutral-default bg-background-neutral-default text-body-medium-default text-foreground-neutral-faded flex h-16 w-full items-center justify-between rounded-2xl border px-4"
              >
                Choose
                <ChevronDown className="size-5 shrink-0" />
              </button>
            </label>
            <Input label="Postal code" placeholder="ZIP / postal code" />
          </div>
        </div>

        <div className="relative z-10 px-4 pt-4 pb-2">
          <Button
            variant="solid"
            size="large"
            onClick={onSubmit}
            className="bg-background-neutral-inverse hover:bg-background-neutral-inverse/90 h-12 w-full rounded-2xl"
          >
            Send my reward
          </Button>
          <HomeIndicatorSpace />
        </div>
      </div>
    </div>
  );
}
