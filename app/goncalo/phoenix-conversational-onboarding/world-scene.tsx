'use client';

import { mergeTailwindClasses as cn } from '@/design/utils';
import { MEMBER, PT, WORLD_BEATS } from './script';
import { ProgressDots, SolidContinue } from './glass';
import { HomeIndicator, StatusBar } from './device-frame';

function LaurenMark({ size = 160 }: { size?: number }) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <span className="absolute inset-[-18%] rounded-full border border-[#c5d4f5]/50" />
      <span className="absolute inset-[-8%] rounded-full border border-[#c5d4f5]/70" />
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(160deg,#d7e4ff_0%,#e8eefc_45%,#f3e6dc_100%)]">
        <span className="font-phoenix text-[56px] text-[#5a6a8a]">
          {PT[0]}
        </span>
      </div>
    </div>
  );
}

function MiniChat({ seedSlot }: { seedSlot: boolean }) {
  return (
    <div className="relative mx-auto h-[280px] w-[210px]">
      <div className="absolute inset-0 rounded-[28px] border border-[#d8dce6]" />
      <div className="absolute inset-3 flex flex-col gap-2.5 pt-8">
        <div className="flex items-end gap-2">
          {seedSlot ? (
            <div className="size-9 shrink-0" />
          ) : (
            <div className="size-9 shrink-0 rounded-full bg-[radial-gradient(circle_at_35%_35%,#ffb3a4,#8ea2f5)]" />
          )}
          <div className="text-foreground-neutral-subtle rounded-2xl bg-white px-3 py-2 text-[11px] leading-4 shadow-sm">
            Hi {MEMBER}. How did that last session feel?
          </div>
        </div>
        <div className="text-foreground-neutral-subtle ml-11 rounded-2xl bg-[#e8f0ff] px-3 py-2 text-[11px] leading-4">
          Lighter already.
        </div>
      </div>
    </div>
  );
}

export function WorldScene({
  index,
  seedReserve,
  onContinue,
}: {
  index: number;
  seedReserve: boolean;
  onContinue: () => void;
}) {
  const beat = WORLD_BEATS[index];
  const glassy = index >= 2;

  return (
    <div className="relative flex h-full flex-col">
      <StatusBar />
      <div className="px-4 pt-2">
        <ProgressDots count={4} index={index} />
      </div>
      <div className="flex flex-1 flex-col px-4 pt-8">
        <h1 className="text-foreground-neutral-default font-phoenix text-[28px] leading-[34px]">
          {beat.title}
        </h1>
        <p className="text-body-large-default text-foreground-neutral-faded mt-3">
          {beat.body}
        </p>
        <div className="relative flex flex-1 items-center justify-center">
          {index === 0 ? (
            <LaurenMark />
          ) : index === 2 ? (
            <div className="relative h-40 w-40">
              <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,rgba(255,176,160,0.35),rgba(140,160,245,0.35),rgba(255,176,160,0.35))] blur-2xl" />
              <div className="text-foreground-neutral-subtle relative flex h-full items-center justify-center font-phoenix text-[22px]">
                Today
              </div>
            </div>
          ) : (
            <MiniChat seedSlot={seedReserve && (index === 1 || index === 3)} />
          )}
        </div>
      </div>
      <div className="px-4 pb-1">
        <SolidContinue
          className="relative z-30"
          glassy={glassy}
          onClick={onContinue}
        >
          Continue
        </SolidContinue>
      </div>
      <HomeIndicator />
    </div>
  );
}

export function WorldBackdrop({ index }: { index: number }) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 transition-opacity duration-700',
        index >= 2 ? 'opacity-100' : 'opacity-70',
      )}
    >
      <div className="phoenix-mesh-a absolute top-[-10%] left-1/2 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,170,150,0.35),rgba(150,160,255,0.18),transparent_68%)] blur-2xl" />
      <div className="phoenix-mesh-b absolute bottom-[-8%] left-1/2 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle_at_center,rgba(140,160,255,0.28),rgba(255,190,170,0.16),transparent_70%)] blur-3xl" />
    </div>
  );
}
