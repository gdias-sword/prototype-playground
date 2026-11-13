'use client';

import { useEffect, useRef, useState } from 'react';

import {
  measureMarquee,
  type MeasuredBox,
  type MeasuredGap,
} from '@/components/xray-measure';

const DRAG_THRESHOLD = 4;

interface Measurement {
  marquee: MeasuredBox;
  boxes: MeasuredBox[];
  gaps: MeasuredGap[];
}

interface XrayLayerProps {
  isArmed: boolean;
}

export function XrayLayer({ isArmed }: XrayLayerProps) {
  const isArmedRef = useRef(isArmed);
  const [measurement, setMeasurement] = useState<Measurement | null>(null);
  isArmedRef.current = isArmed;

  useEffect(() => {
    if (isArmed) {
      document.documentElement.dataset.xray = 'armed';
      return () => {
        delete document.documentElement.dataset.xray;
      };
    }
    delete document.documentElement.dataset.xray;
  }, [isArmed]);

  useEffect(() => {
    const previousCursor = document.body.style.cursor;
    if (!isArmed) return;
    document.body.style.cursor = 'crosshair';
    return () => {
      document.body.style.cursor = previousCursor;
    };
  }, [isArmed]);

  useEffect(() => {
    let originX = 0;
    let originY = 0;
    let pointerId = -1;
    let listening = false;

    function claim(event: PointerEvent) {
      if (event.button !== 0) return;
      if (!isArmedRef.current && !event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('[data-prototype-chrome], [data-comment-ui]')) return;

      event.preventDefault();
      event.stopPropagation();
      originX = event.clientX;
      originY = event.clientY;
      pointerId = event.pointerId;
      document.documentElement.dataset.xrayGesture = '1';
      document.body.style.userSelect = 'none';
      window.addEventListener('pointermove', update, true);
      window.addEventListener('pointerup', finish, true);
      window.addEventListener('pointercancel', finish, true);
      window.addEventListener('keydown', cancel, true);
      listening = true;
    }

    function update(event: PointerEvent) {
      if (event.pointerId !== pointerId) return;
      event.preventDefault();
      event.stopPropagation();
      const marquee = normalize(originX, originY, event.clientX, event.clientY);
      if (marquee.width < DRAG_THRESHOLD && marquee.height < DRAG_THRESHOLD) {
        return;
      }
      setMeasurement({ marquee, ...measureMarquee(marquee) });
    }

    function finish(event: PointerEvent) {
      if (event.pointerId !== pointerId) return;
      event.preventDefault();
      event.stopPropagation();
      release();
    }

    function cancel(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopImmediatePropagation();
      release();
    }

    function release() {
      if (!listening) return;
      listening = false;
      pointerId = -1;
      setMeasurement(null);
      document.body.style.userSelect = '';
      window.removeEventListener('pointermove', update, true);
      window.removeEventListener('pointerup', finish, true);
      window.removeEventListener('pointercancel', finish, true);
      window.removeEventListener('keydown', cancel, true);
      window.setTimeout(() => {
        delete document.documentElement.dataset.xrayGesture;
      }, 0);
    }

    function suppressClick(event: MouseEvent) {
      if (document.documentElement.dataset.xrayGesture !== '1') return;
      event.preventDefault();
      event.stopImmediatePropagation();
      delete document.documentElement.dataset.xrayGesture;
    }

    document.addEventListener('pointerdown', claim, true);
    document.addEventListener('click', suppressClick, true);
    return () => {
      document.removeEventListener('pointerdown', claim, true);
      document.removeEventListener('click', suppressClick, true);
      release();
    };
  }, []);

  if (!measurement) return null;

  return (
    <div
      data-prototype-chrome
      data-xray-overlay
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[9000]"
    >
      {measurement.boxes.map((box) => (
        <div
          key={`box-${box.left}-${box.top}-${box.width}-${box.height}`}
          className="absolute outline outline-1"
          style={{
            left: box.left,
            top: box.top,
            width: box.width,
            height: box.height,
            outlineColor: 'var(--color-blue-500)',
            background:
              'color-mix(in oklch, var(--color-blue-500) 12%, transparent)',
          }}
        />
      ))}
      {measurement.gaps.map((gap) => (
        <div
          key={`gap-${gap.left}-${gap.top}-${gap.width}-${gap.height}`}
          className="absolute"
          style={{
            left: gap.left,
            top: gap.top,
            width: gap.width,
            height: gap.height,
            backgroundImage:
              'repeating-linear-gradient(135deg, color-mix(in oklch, var(--color-blue-500) 50%, transparent) 0 2px, transparent 2px 6px)',
          }}
        />
      ))}
      <div
        className="absolute border border-dashed"
        style={{
          left: measurement.marquee.left,
          top: measurement.marquee.top,
          width: measurement.marquee.width,
          height: measurement.marquee.height,
          borderColor: 'var(--color-blue-500)',
        }}
      />
      {visibleLabels(measurement).map((label) => (
        <MeasurementLabel
          key={label.key}
          left={label.left}
          top={label.top}
          text={label.text}
          centered={label.centered}
        />
      ))}
    </div>
  );
}

function visibleLabels(measurement: Measurement) {
  const placed: Array<{ left: number; top: number }> = [];
  const labels: Array<{
    key: string;
    left: number;
    top: number;
    text: string;
    centered?: boolean;
  }> = [];

  function place(
    key: string,
    left: number,
    top: number,
    text: string,
    centered = false,
  ) {
    const crowded = placed.some(
      (label) =>
        Math.abs(label.left - left) < 20 && Math.abs(label.top - top) < 16,
    );
    if (crowded) return;
    placed.push({ left, top });
    labels.push({ key, left, top, text, centered });
  }

  for (const box of measurement.boxes) {
    const inside = box.width >= 72 && box.height >= 28;
    place(
      `size-${box.left}-${box.top}-${box.width}-${box.height}`,
      inside ? box.left + 4 : box.left,
      inside ? box.top + 4 : box.top - 20,
      `${Math.round(box.width)} × ${Math.round(box.height)}`,
    );
  }
  for (const gap of measurement.gaps) {
    place(
      `gap-${gap.left}-${gap.top}-${gap.width}-${gap.height}`,
      gap.left + gap.width / 2,
      gap.top + gap.height / 2,
      `${Math.round(gap.size)}`,
      true,
    );
  }
  return labels;
}

function MeasurementLabel({
  left,
  top,
  text,
  centered = false,
}: {
  left: number;
  top: number;
  text: string;
  centered?: boolean;
}) {
  return (
    <span
      className="text-body-small-strong text-foreground-neutral-inverse absolute rounded px-1"
      style={{
        left,
        top: Math.max(4, top),
        transform: centered ? 'translate(-50%, -50%)' : undefined,
        background: 'var(--color-blue-500)',
      }}
    >
      {text}
    </span>
  );
}

function normalize(
  originX: number,
  originY: number,
  x: number,
  y: number,
): MeasuredBox {
  return {
    left: Math.min(originX, x),
    top: Math.min(originY, y),
    width: Math.abs(x - originX),
    height: Math.abs(y - originY),
  };
}
