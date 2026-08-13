import { mergeTailwindClasses as cn } from '@/design/utils';
import type { ReactNode } from 'react';

export function StatusBar({ light = true }: { light?: boolean }) {
  const fill = light ? 'black' : 'white';

  return (
    <div className="flex h-12 shrink-0 items-end justify-between px-7 pb-1.5">
      <span
        className={cn(
          'text-[15px] font-semibold',
          light ? 'text-foreground-neutral-default' : 'text-white',
        )}
      >
        9:41
      </span>
      <svg width="68" height="12" viewBox="0 0 68 12" fill="none" aria-hidden>
        <path
          d="M1 8.5C1 8.5 3 3.5 8 3.5C13 3.5 14 8.5 14 8.5"
          stroke={fill}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M16 8.5C16 8.5 18 3.5 23 3.5C28 3.5 29 8.5 29 8.5"
          stroke={fill}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M31 8.5C31 8.5 33 3.5 38 3.5C43 3.5 44 8.5 44 8.5"
          stroke={fill}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <rect
          x="48"
          y="1"
          width="18"
          height="10"
          rx="2"
          stroke={fill}
          strokeWidth="1.2"
        />
        <rect x="50" y="3" width="12" height="6" rx="0.8" fill={fill} />
      </svg>
    </div>
  );
}

export function HomeIndicator({ light = true }: { light?: boolean }) {
  return (
    <div className="flex h-8 shrink-0 items-center justify-center">
      <span
        className={cn(
          'h-[5px] w-[134px] rounded-full',
          light ? 'bg-foreground-neutral-default/80' : 'bg-white/80',
        )}
      />
    </div>
  );
}

export function DeviceFrame({ children }: { children: ReactNode }) {
  return (
    <div className="border-background-neutral-inverse bg-background-neutral-default h-[812px] w-[375px] overflow-hidden rounded-[44px] border-[10px]">
      <div className="relative h-full w-full">{children}</div>
    </div>
  );
}
