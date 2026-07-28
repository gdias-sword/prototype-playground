'use client';

import { mergeTailwindClasses as cn } from '@/design/utils';
import { useEffect, useRef, useState } from 'react';

interface AnimatedPriceProps {
  value: number;
  className?: string;
  duration?: number;
}

function formatPrice(amount: number) {
  return `$${Math.round(amount)}`;
}

export function AnimatedPrice({
  value,
  className,
  duration = 640,
}: AnimatedPriceProps) {
  const [display, setDisplay] = useState(value);
  const currentRef = useRef(value);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const from = currentRef.current;
    if (Math.abs(from - value) < 0.01) return;

    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = from + (value - from) * eased;

      currentRef.current = next;
      setDisplay(next);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        currentRef.current = value;
        setDisplay(value);
      }
    }

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== undefined) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, duration]);

  return (
    <span
      className={cn('inline-block tabular-nums', className)}
      aria-live="polite"
      aria-atomic="true"
    >
      {formatPrice(display)}
    </span>
  );
}
