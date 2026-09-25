'use client';

import welcomeKitBox from './assets/welcome-kit-box.png';
import { PrimaryAction } from './extended-scenes';
import { GET_KIT_LABEL } from './script';

function assetSrc(asset: string | { src: string }) {
  return typeof asset === 'string' ? asset : asset.src;
}

export function RewardRevealScene({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col px-4">
      <KitShadowFilter />
      <h1 className="text-foreground-neutral-default mt-8 text-center font-sans text-[32px] leading-[40px] font-medium tracking-[-0.01em]">
        You&apos;ve earned your
        <br />
        <span className="bg-gradient-to-r from-[#5f97f0] to-[#3a70c7] bg-clip-text text-transparent">
          Welcome Kit
        </span>
      </h1>
      <div className="flex min-h-0 flex-1 items-start justify-center">
        <img
          alt="Welcome kit with resistance bands"
          src={assetSrc(welcomeKitBox)}
          className="-mb-20 h-[448px] w-auto max-w-none object-contain [filter:url(#welcome-kit-shadow)]"
        />
      </div>
      <div className="relative z-10 mt-auto w-full pt-4 pb-2">
        <PrimaryAction onClick={onContinue}>{GET_KIT_LABEL}</PrimaryAction>
      </div>
    </div>
  );
}

function KitShadowFilter() {
  return (
    <svg aria-hidden className="pointer-events-none absolute size-0">
      <filter
        id="welcome-kit-shadow"
        x="-50%"
        y="-50%"
        width="200%"
        height="200%"
        colorInterpolationFilters="sRGB"
      >
        <feDropShadow
          in="SourceAlpha"
          dx="0"
          dy="2"
          stdDeviation="2"
          floodColor="#000000"
          floodOpacity="0.4"
          result="contact"
        />
        <feDropShadow
          in="SourceAlpha"
          dx="0"
          dy="8"
          stdDeviation="20"
          floodColor="#000000"
          floodOpacity="0.2"
          result="lift"
        />
        <feDropShadow
          in="SourceAlpha"
          dx="0"
          dy="2"
          stdDeviation="2"
          floodColor="#3D5F8F"
          floodOpacity="0.2"
          result="contactBlue"
        />
        <feDropShadow
          in="SourceAlpha"
          dx="0"
          dy="12"
          stdDeviation="20"
          floodColor="#3D5F8F"
          floodOpacity="0.4"
          result="ambient"
        />
        <feMerge>
          <feMergeNode in="contact" />
          <feMergeNode in="lift" />
          <feMergeNode in="contactBlue" />
          <feMergeNode in="ambient" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </svg>
  );
}
