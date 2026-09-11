'use client';

import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
import * as React from 'react';

import { cn } from '@/design/utils';

function TooltipProvider({
  delay = 80,
  closeDelay = 0,
  ...props
}: TooltipPrimitive.Provider.Props) {
  return (
    <TooltipPrimitive.Provider
      delay={delay}
      closeDelay={closeDelay}
      {...props}
    />
  );
}

function Tooltip(props: TooltipPrimitive.Root.Props) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger(props: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

type TooltipContentProps = Omit<TooltipPrimitive.Popup.Props, 'children'> & {
  children: React.ReactNode;
  side?: TooltipPrimitive.Positioner.Props['side'];
  sideOffset?: TooltipPrimitive.Positioner.Props['sideOffset'];
  align?: TooltipPrimitive.Positioner.Props['align'];
  showArrow?: boolean;
};

function TooltipContent({
  className,
  children,
  side = 'top',
  sideOffset = 12,
  align = 'center',
  showArrow = true,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        collisionPadding={8}
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            'text-body-medium-default pointer-events-none z-50 max-w-[260px] min-w-[80px] rounded-lg px-2 py-1.5 text-center leading-[18px] font-medium select-none',
            'bg-background-neutral-inverse text-foreground-neutral-inverse',
            'shadow-[0_6px_17px_rgba(31,34,44,0.07)]',
            'transition-[opacity,translate] duration-200 ease-out',
            'data-ending-style:opacity-0 data-starting-style:opacity-0',
            'data-[side=top]:data-ending-style:translate-y-1 data-[side=top]:data-starting-style:translate-y-1',
            'data-[side=bottom]:data-ending-style:-translate-y-1 data-[side=bottom]:data-starting-style:-translate-y-1',
            'data-[side=left]:data-ending-style:translate-x-1 data-[side=left]:data-starting-style:translate-x-1',
            'data-[side=right]:data-ending-style:-translate-x-1 data-[side=right]:data-starting-style:-translate-x-1',
            className,
          )}
          {...props}
        >
          {children}
          {showArrow && (
            <TooltipPrimitive.Arrow
              data-slot="tooltip-arrow"
              className={cn(
                'flex items-center justify-center',
                'data-[side=bottom]:rotate-180',
                'data-[side=left]:-rotate-90',
                'data-[side=right]:rotate-90',
              )}
            >
              <svg
                width="24"
                height="12"
                viewBox="0 0 24 12"
                className="fill-background-neutral-inverse block"
                aria-hidden="true"
              >
                <path d="M0 0h24L13.59 10.59a2.25 2.25 0 0 1-3.18 0L0 0Z" />
              </svg>
            </TooltipPrimitive.Arrow>
          )}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
