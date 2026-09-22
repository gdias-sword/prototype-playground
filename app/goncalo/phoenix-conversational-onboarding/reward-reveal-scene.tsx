'use client';

import welcomeKitBox from './assets/welcome-kit-box.png';
import { PrimaryAction } from './extended-scenes';
import { GET_KIT_LABEL } from './script';

function assetSrc(asset: string | { src: string }) {
  return typeof asset === 'string' ? asset : asset.src;
}

export function RewardRevealScene({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col px-4">
      <h1 className="text-display-small-strong text-foreground-neutral-default text-center font-serif font-medium tracking-[-0.04em]">
        You&apos;ve earned your
        <br />
        <span className="bg-gradient-to-r from-[#5f97f0] to-[#3a70c7] bg-clip-text text-transparent">
          Welcome Kit
        </span>
      </h1>
      <div className="mt-8 flex min-h-0 flex-1 items-center justify-center">
        <img
          alt="Welcome kit with resistance bands"
          src={assetSrc(welcomeKitBox)}
          className="h-full max-h-[360px] w-full max-w-[343px] object-contain"
        />
      </div>
      <div className="mt-auto w-full pt-4 pb-2">
        <PrimaryAction onClick={onContinue}>{GET_KIT_LABEL}</PrimaryAction>
      </div>
    </div>
  );
}
