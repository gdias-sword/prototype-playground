'use client';

import { Button } from '@/design/components/button';
import bandHeavy from './assets/reward-band-heavy.png';
import bandLight from './assets/reward-band-light.png';
import bandMedium from './assets/reward-band-medium.png';
import shippingMesh from './assets/reward-shipping-mesh.png';
import { HomeIndicatorSpace, StatusBar } from './device-frame';

function assetSrc(asset: string | { src: string }) {
  return typeof asset === 'string' ? asset : asset.src;
}

export function RewardConfirmationScene({
  onContinue,
}: {
  onContinue: () => void;
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
        <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-4 pt-12 pb-4">
          <div className="relative size-[320px] shrink-0">
            <div className="absolute top-[calc(50%+69px)] left-[calc(50%-88px)] h-[172px] w-[107px] -translate-x-1/2 -translate-y-1/2">
              <img
                alt=""
                aria-hidden
                src={assetSrc(bandHeavy)}
                className="size-full object-contain"
              />
            </div>
            <div className="absolute top-[calc(50%-61px)] left-[calc(50%-4px)] h-[181px] w-[139px] -translate-x-1/2 -translate-y-1/2">
              <img
                alt=""
                aria-hidden
                src={assetSrc(bandLight)}
                className="size-full object-contain"
              />
            </div>
            <div className="absolute top-[calc(50%+37px)] left-[calc(50%+56px)] h-[240px] w-[175px] -translate-x-1/2 -translate-y-1/2">
              <img
                alt=""
                aria-hidden
                src={assetSrc(bandMedium)}
                className="size-full rotate-[30deg] object-contain"
              />
            </div>
          </div>

          <div className="mt-6 flex w-full max-w-[343px] flex-col gap-4 text-center">
            <h1 className="text-display-small-strong text-foreground-neutral-default font-serif font-medium tracking-[-0.04em]">
              Your new resistance bands are on the way
            </h1>
            <p className="text-body-large-default text-foreground-neutral-strong">
              Nice work completing your first session!
            </p>
          </div>
        </div>

        <div className="relative z-10 px-4 pt-8 pb-2">
          <Button
            variant="solid"
            size="large"
            onClick={onContinue}
            className="bg-background-neutral-inverse hover:bg-background-neutral-inverse/90 h-12 w-full rounded-2xl"
          >
            Continue
          </Button>
          <HomeIndicatorSpace />
        </div>
      </div>
    </div>
  );
}
