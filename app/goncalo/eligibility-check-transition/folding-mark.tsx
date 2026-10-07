'use client';

import { useEffect, useId, useRef, useState } from 'react';

type Pose = { y: number; outer: number; inner: number };

const TOP_Y = 17;
const BOTTOM_Y = 47.8;
const RING_OUTER = 14;
const RING_INNER = 8.909;
const DISK_OUTER = 11.2;
const NESTED_OUTER = 3.6;

const VIEWBOX_WIDTH = 30;
const VIEWBOX_HEIGHT = 61;

function lerp(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

// Ease in and out at the two end states: ring on top with the disk below,
// and the inverse. Each half of the loop is one trip between those poses.
function easeInOut(t: number) {
  return (1 - Math.cos(Math.PI * t)) / 2;
}

// Going down, the ring closes into the disk.
// Going up, the disk shrinks through the ring, then opens into the next ring.
function sample(phase: number): Pose {
  const p = ((phase % 1) + 1) % 1;
  const descending = p < 0.5;
  const s = easeInOut(descending ? p * 2 : (p - 0.5) * 2);
  const y = descending ? lerp(TOP_Y, BOTTOM_Y, s) : lerp(BOTTOM_Y, TOP_Y, s);

  if (descending) {
    return {
      y,
      outer: lerp(RING_OUTER, DISK_OUTER, s),
      inner: lerp(RING_INNER, 0, s),
    };
  }

  if (s < 0.5) {
    return { y, outer: lerp(DISK_OUTER, NESTED_OUTER, s * 2), inner: 0 };
  }

  const u = (s - 0.5) * 2;
  return {
    y,
    outer: lerp(NESTED_OUTER, RING_OUTER, u),
    inner: lerp(0, RING_INNER, u),
  };
}

export function FoldingMark({
  width,
  phase,
  title,
}: {
  width: number;
  phase: number;
  title?: string;
}) {
  const rawId = useId().replace(/:/g, '');
  const ringFill = `${rawId}-ring`;
  const dotFill = `${rawId}-dot`;
  const sheen = `${rawId}-sheen`;
  const linear = sample(phase);
  const radial = sample(phase + 0.5);

  const shapes = [
    { pose: radial, stroke: `url(#${dotFill})` },
    { pose: linear, stroke: `url(#${ringFill})`, sheen: `url(#${sheen})` },
  ].sort((a, b) => {
    const aClimbing =
      a.pose.y < b.pose.y - 0.5 && a.pose.outer < b.pose.outer - 0.5;
    const bClimbing =
      b.pose.y < a.pose.y - 0.5 && b.pose.outer < a.pose.outer - 0.5;
    if (aClimbing !== bClimbing) return aClimbing ? 1 : -1;
    return a.pose.inner - b.pose.inner || a.pose.y - b.pose.y;
  });

  return (
    <svg
      width={width}
      height={(width * VIEWBOX_HEIGHT) / VIEWBOX_WIDTH}
      viewBox="-1 -1 30 61"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <linearGradient
          id={ringFill}
          x1="10.37"
          y1="-10.37"
          x2="-31.45"
          y2="29.86"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.121" stopColor="#3192D0" />
          <stop offset="0.267" stopColor="#6966AC" />
          <stop offset="0.432" stopColor="#EC5F74" />
          <stop offset="1" stopColor="#F05863" />
        </linearGradient>
        <radialGradient
          id={dotFill}
          cx="18"
          cy="-8.7"
          r="36"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.178" stopColor="#6966AC" />
          <stop offset="0.658" stopColor="#E06971" />
          <stop offset="1" stopColor="#FF5460" />
        </radialGradient>
        <radialGradient
          id={sheen}
          cx="-4.4"
          cy="-14"
          r="11"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff" />
          <stop offset="1" stopColor="#999" stopOpacity="0" />
        </radialGradient>
      </defs>
      {shapes.map((shape) => (
        <MarkShape
          key={shape.stroke}
          pose={shape.pose}
          stroke={shape.stroke}
          sheen={shape.sheen}
        />
      ))}
    </svg>
  );
}

function MarkShape({
  pose,
  stroke,
  sheen,
}: {
  pose: Pose;
  stroke: string;
  sheen?: string;
}) {
  const scale = pose.outer / 14;
  const localInner = (pose.inner / pose.outer) * 14;
  const mid = (14 + localInner) / 2;
  const width = 14 - localInner;

  return (
    <g transform={`translate(14 ${pose.y}) scale(${scale})`}>
      <circle r={mid} fill="none" stroke={stroke} strokeWidth={width} />
      {sheen ? (
        <circle
          r={mid}
          fill="none"
          stroke={sheen}
          strokeWidth={width}
          opacity={0.2}
        />
      ) : null}
    </g>
  );
}

export function useFoldingPhase(playing: boolean, duration = 2400) {
  const [phase, setPhase] = useState(0);
  const phaseRef = useRef(0);

  useEffect(() => {
    if (!playing) return;
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduce) {
      phaseRef.current = 0;
      setPhase(0);
      return;
    }

    phaseRef.current = 0;
    setPhase(0);
    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      phaseRef.current = (phaseRef.current + (now - last) / duration) % 1;
      last = now;
      setPhase(phaseRef.current);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, duration]);

  return phase;
}

export function SwordLoader({
  height,
  playing = true,
  phase,
  duration = 2400,
  title,
}: {
  height: number;
  playing?: boolean;
  phase?: number;
  duration?: number;
  title?: string;
}) {
  const animated = useFoldingPhase(phase === undefined && playing, duration);
  return (
    <FoldingMark
      width={(height * VIEWBOX_WIDTH) / VIEWBOX_HEIGHT}
      phase={phase ?? animated}
      title={title}
    />
  );
}
