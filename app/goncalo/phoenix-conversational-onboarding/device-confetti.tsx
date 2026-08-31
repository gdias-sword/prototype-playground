'use client';

import confetti, { type Options } from 'canvas-confetti';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react';

type DeviceConfettiFire = (options?: Options) => void;

type DeviceConfettiContextValue = {
  fireConfetti: DeviceConfettiFire;
  frameRef: RefObject<HTMLDivElement | null>;
};

const DeviceConfettiContext = createContext<DeviceConfettiContextValue | null>(
  null,
);

export function useDeviceConfetti() {
  const context = useContext(DeviceConfettiContext);
  if (!context) {
    throw new Error('useDeviceConfetti must be used within DeviceFrame');
  }
  return context;
}

export function DeviceConfettiProvider({ children }: { children: ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiRef = useRef<DeviceConfettiFire | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    confettiRef.current = confetti.create(canvas, {
      resize: true,
      useWorker: false,
    });

    return () => {
      confettiRef.current = null;
    };
  }, []);

  const fireConfetti = useCallback<DeviceConfettiFire>((options) => {
    confettiRef.current?.({
      disableForReducedMotion: true,
      ...options,
    });
  }, []);

  return (
    <DeviceConfettiContext.Provider value={{ fireConfetti, frameRef }}>
      <div ref={frameRef} className="relative h-full w-full overflow-hidden">
        {children}
        <canvas
          ref={canvasRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[60] h-full w-full"
        />
      </div>
    </DeviceConfettiContext.Provider>
  );
}

export function confettiOriginFromElement(
  frame: HTMLElement,
  element: HTMLElement,
) {
  const frameRect = frame.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();

  return {
    x: (elementRect.left + elementRect.width / 2 - frameRect.left) / frameRect.width,
    y: (elementRect.top + elementRect.height / 2 - frameRect.top) / frameRect.height,
  };
}
