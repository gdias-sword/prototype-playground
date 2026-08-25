import { mergeTailwindClasses as cn } from '@/design/utils';
import type { ReactNode } from 'react';

/** Orb slot + gap shared by ContinuityPanel and compact conversation tool steps. Wrap only the current heading — not scrollback history. */
export function PanelHeaderStack({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div className="size-10 shrink-0" aria-hidden />
      {children}
    </div>
  );
}
