import { cn } from '@/design/utils';
import type { ReactNode } from 'react';
import { DeviceConfettiProvider } from './device-confetti';

function CellularSignal() {
  return (
    <svg
      width="17"
      height="12"
      viewBox="0 0 17 12"
      fill="currentColor"
      aria-hidden
    >
      <rect x="0" y="7.5" width="3" height="4.5" rx="0.6" />
      <rect x="4.5" y="5.2" width="3" height="6.8" rx="0.6" />
      <rect x="9" y="2.6" width="3" height="9.4" rx="0.6" />
      <rect x="13.5" y="0" width="3" height="12" rx="0.6" />
    </svg>
  );
}

function WifiSignal() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden>
      <path
        d="M1.2 3.95a9.1 9.1 0 0 1 13.6 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M3.4 6.4a5.8 5.8 0 0 1 9.2 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M5.6 8.8a2.65 2.65 0 0 1 4.8 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="8" cy="11.05" r="1.05" fill="currentColor" />
    </svg>
  );
}

function BatteryLevel() {
  return (
    <svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden>
      <rect
        x="0.5"
        y="0.5"
        width="21"
        height="11"
        rx="2.5"
        stroke="currentColor"
        strokeOpacity="0.36"
        strokeWidth="1"
      />
      <rect x="2" y="2" width="18" height="8" rx="1.35" fill="currentColor" />
      <rect
        x="23"
        y="3.8"
        width="1.6"
        height="4.4"
        rx="0.8"
        fill="currentColor"
        fillOpacity="0.4"
      />
    </svg>
  );
}

export function StatusBar({ light = true }: { light?: boolean }) {
  return (
    <div
      className={cn(
        'flex h-12 shrink-0 items-end justify-between px-7 pb-1.5',
        light ? 'text-foreground-neutral-default' : 'text-white',
      )}
    >
      <span className="text-[15px] leading-none font-semibold tracking-[-0.02em] tabular-nums">
        8:34
      </span>
      <div className="flex items-center gap-[6px] pb-[1px]">
        <CellularSignal />
        <WifiSignal />
        <BatteryLevel />
      </div>
    </div>
  );
}

export function HomeIndicator({ light = true }: { light?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex h-12 items-center justify-center">
      <span
        className={cn(
          'h-[5px] w-[134px] rounded-full',
          light ? 'bg-foreground-neutral-default/80' : 'bg-white/80',
        )}
      />
    </div>
  );
}

export function HomeIndicatorSpace() {
  return <div className="h-12 shrink-0" aria-hidden />;
}

export function DeviceFrame({ children }: { children: ReactNode }) {
  return (
    <div className="border-background-neutral-inverse bg-background-neutral-default h-[812px] w-[375px] overflow-hidden rounded-[44px] border-[10px]">
      <DeviceConfettiProvider>
        {children}
        <HomeIndicator />
      </DeviceConfettiProvider>
    </div>
  );
}
