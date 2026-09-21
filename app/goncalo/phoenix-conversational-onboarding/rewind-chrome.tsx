import { cn } from '@/design/utils';
import { ChevronLeft } from 'lucide-react';
import type { PhoenixStep } from './phoenix-scene';

export function showsProgress(step: PhoenixStep) {
  return step.kind !== 'guide' && step.kind !== 'ready';
}

export function canRewindFrom(previous?: PhoenixStep) {
  return previous != null && showsProgress(previous);
}

export function progressForStep(step: PhoenixStep) {
  if (step.kind === 'guide' || step.kind === 'ready') return 0;
  if (step.kind === 'know' && step.index === 0) return 0.18;
  if (step.kind === 'region') return 0.28;
  if (step.kind === 'know' && step.index === 1) return 0.38;
  if (step.kind === 'know' && step.index === 2) return 0.48;
  if (step.kind === 'impact' || (step.kind === 'know' && step.index === 3)) {
    return 0.58;
  }
  if (step.kind === 'more') return 0.66;
  if (step.kind === 'activity') return 0.74;
  if (step.kind === 'session' || step.kind === 'offer') return 0.82;
  if (step.kind === 'safety' || step.kind === 'camera') return 0.88;
  if (step.kind === 'call' || step.kind === 'schedule' || step.kind === 'remind') {
    return 0.92;
  }
  return 0.96;
}

export function ProgressRail({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const width = `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`;

  return (
    <div
      className={cn(
        'bg-foreground-neutral-faded/30 relative h-0.5 min-w-0 flex-1 overflow-hidden rounded-full',
        className,
      )}
      role="progressbar"
      aria-label="Intake progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(Math.min(1, Math.max(0, value)) * 100)}
    >
      <div
        className="bg-foreground-neutral-default absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ width }}
      />
    </div>
  );
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Previous question"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={cn(
        'flex size-[42px] shrink-0 items-center justify-center rounded-full border border-white',
        'bg-white/80 shadow-[0_8px_24px_rgba(31,34,44,0.06)] backdrop-blur-xl',
        'cursor-pointer transition-[opacity,transform] duration-200',
      )}
    >
      <ChevronLeft className="text-foreground-neutral-default size-6" />
    </button>
  );
}
