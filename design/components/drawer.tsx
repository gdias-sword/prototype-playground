'use client';

import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer';
import * as React from 'react';

import { cn } from '@/design/utils';

interface DrawerContextValue {
  hasSnapPoints: boolean;
  modal: DrawerPrimitive.Root.Props['modal'];
  showSwipeHandle: boolean;
}

const DrawerContext = React.createContext<DrawerContextValue | null>(null);

function useDrawer() {
  const context = React.useContext(DrawerContext);

  if (!context) {
    throw new Error('useDrawer must be used within a Drawer.');
  }

  return context;
}

interface DrawerProps extends Omit<
  DrawerPrimitive.Root.Props,
  'swipeDirection'
> {
  showSwipeHandle?: boolean;
}

function Drawer({
  modal = true,
  showSwipeHandle = true,
  snapPoints,
  ...props
}: DrawerProps) {
  const hasSnapPoints = snapPoints != null && snapPoints.length > 0;
  const contextValue = React.useMemo(
    () => ({ hasSnapPoints, modal, showSwipeHandle }),
    [hasSnapPoints, modal, showSwipeHandle],
  );

  return (
    <DrawerContext.Provider value={contextValue}>
      <DrawerPrimitive.Root
        data-slot="drawer"
        modal={modal}
        snapPoints={snapPoints}
        swipeDirection="down"
        {...props}
      />
    </DrawerContext.Provider>
  );
}

function DrawerTrigger(props: DrawerPrimitive.Trigger.Props) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal(props: DrawerPrimitive.Portal.Props) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose(props: DrawerPrimitive.Close.Props) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({
  className,
  ...props
}: DrawerPrimitive.Backdrop.Props) {
  const { hasSnapPoints } = useDrawer();

  return (
    <DrawerPrimitive.Backdrop
      data-slot="drawer-overlay"
      data-snap-points={hasSnapPoints ? '' : undefined}
      className={cn(
        'bg-background-neutral-inverse/40 fixed inset-0 z-50 min-h-dvh select-none',
        'opacity-[max(var(--drawer-overlay-min-opacity,0),calc(1-var(--drawer-swipe-progress)))]',
        'transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)]',
        'data-ending-style:pointer-events-none data-ending-style:opacity-0',
        'data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)]',
        'data-snap-points:[--drawer-overlay-min-opacity:0.5]',
        'data-starting-style:opacity-0 data-swiping:duration-0',
        'supports-[-webkit-touch-callout:none]:absolute',
        className,
      )}
      {...props}
    />
  );
}

function DrawerSwipeHandle({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-swipe-handle"
      aria-hidden="true"
      className={cn(
        'relative z-10 flex h-5 w-full shrink-0 cursor-grab items-end justify-center pb-1',
        'transition-opacity duration-200 ease-out',
        'group-data-nested-drawer-open/drawer-popup:opacity-0',
        'group-data-nested-drawer-swiping/drawer-popup:opacity-100',
        'active:cursor-grabbing',
        'after:bg-border-neutral-strong after:block after:h-1 after:w-10 after:shrink-0 after:rounded-full',
        className,
      )}
      {...props}
    />
  );
}

function DrawerContent({
  className,
  children,
  ...props
}: DrawerPrimitive.Popup.Props) {
  const { hasSnapPoints, modal, showSwipeHandle } = useDrawer();

  return (
    <DrawerPortal>
      {modal === true && <DrawerOverlay />}
      <DrawerPrimitive.Viewport
        data-slot="drawer-viewport"
        data-modal={modal}
        className="pointer-events-none fixed inset-0 z-50 select-none data-[modal=true]:pointer-events-auto"
      >
        <DrawerPrimitive.Popup
          data-slot="drawer-popup"
          data-snap-points={hasSnapPoints ? '' : undefined}
          className={cn(
            'group/drawer-popup pointer-events-auto fixed inset-x-0 bottom-0 z-50 flex min-h-0 origin-bottom flex-col will-change-transform outline-none select-none',
            'm-(--drawer-inset,0px) h-(--drawer-content-height) max-h-(--drawer-content-max-height,none) w-full',
            'transform-[translate3d(0,var(--translate-y,0px),0)_scale(var(--stack-scale))]',
            'border-border-neutral-subtle bg-background-neutral-default text-body-medium-default text-foreground-neutral-default rounded-t-2xl border-t',
            'pb-[env(safe-area-inset-bottom)]',
            'transition-[transform,height,opacity] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
            '[interpolate-size:allow-keywords]',
            'data-nested-drawer-open:overflow-hidden data-nested-drawer-open:brightness-95',
            'after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-(--bleed) after:bg-(--drawer-bleed-background,var(--color-background-neutral-default))',
            '[--drawer-content-height:var(--drawer-height,auto)] [--drawer-content-max-height:calc(100dvh-6rem)]',
            'data-snap-points:[--drawer-content-height:100dvh]',
            '[--bleed:3rem] [--peek:1rem]',
            '[--stack-height:var(--drawer-frontmost-height,var(--drawer-height,0px))]',
            '[--stack-progress:clamp(0,var(--drawer-swipe-progress),1)]',
            '[--stack-peek-offset:max(0px,calc((var(--nested-drawers)-var(--stack-progress))*var(--peek)))]',
            '[--stack-step:0.05]',
            '[--stack-scale-base:max(0,calc(1-(var(--nested-drawers)*var(--stack-step))))]',
            '[--stack-scale:clamp(0,calc(var(--stack-scale-base)+(var(--stack-step)*var(--stack-progress))),1)]',
            '[--stack-shrink:calc(1-var(--stack-scale))]',
            '[--closed-transform:translate3d(0,calc(100%+var(--drawer-inset,0px)+2px),0)]',
            '[--translate-y:calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y)-var(--stack-peek-offset)-(var(--stack-shrink)*var(--stack-height)))]',
            'data-nested-drawer-open:h-(--stack-height)',
            'data-ending-style:transform-(--closed-transform) data-starting-style:transform-(--closed-transform)',
            'data-ending-style:opacity-[0.9999] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)]',
            'data-nested-drawer-swiping:duration-0 data-swiping:duration-0',
            'data-ending-style:data-swiping:duration-[calc(var(--drawer-swipe-strength)*400ms)]',
            'data-ending-style:data-nested-drawer-swiping:duration-[calc(var(--drawer-swipe-strength)*400ms)]',
            className,
          )}
          {...props}
        >
          {showSwipeHandle ? <DrawerSwipeHandle /> : null}
          <DrawerPrimitive.Content
            data-slot="drawer-content"
            className="flex min-h-0 flex-1 flex-col overflow-hidden overscroll-contain rounded-[inherit] transition-opacity duration-300 ease-out select-text group-data-nested-drawer-open/drawer-popup:opacity-0 group-data-nested-drawer-swiping/drawer-popup:opacity-100 group-data-swiping/drawer-popup:select-none"
          >
            {children}
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-header"
      className={cn('flex shrink-0 flex-col gap-1 px-5 pt-1', className)}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn(
        'mt-auto flex shrink-0 flex-col gap-2 px-5 pt-4 pb-5',
        className,
      )}
      {...props}
    />
  );
}

function DrawerTitle({ className, ...props }: DrawerPrimitive.Title.Props) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn(
        'text-title-small-strong text-foreground-neutral-default',
        className,
      )}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: DrawerPrimitive.Description.Props) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn(
        'text-body-medium-default text-foreground-neutral-faded text-pretty',
        className,
      )}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerSwipeHandle,
  DrawerTitle,
  DrawerTrigger,
};
