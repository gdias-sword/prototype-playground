'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { capture, release } from './pointer-capture';

const SWIPE_RANGE_PX = 130;
const SWIPE_START_PX = 8;
const SWIPE_COMMIT_AT = 0.45;
const WHEEL_SETTLE_MS = 160;
const CLICK_SUPPRESS_MS = 300;

/** Rightward drag steps one question back, matching the native edge-swipe idiom. */
export function useSwipeBack({
  enabled,
  onCommit,
}: {
  enabled: boolean;
  onCommit: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const progressRef = useRef(0);
  const pointerRef = useRef<number | null>(null);
  const originRef = useRef({ x: 0, y: 0 });
  const activeRef = useRef(false);
  const endedAtRef = useRef(0);
  const wheelRef = useRef(0);
  const wheelTimerRef = useRef(0);

  const apply = useCallback((value: number) => {
    const next = Math.min(1, Math.max(0, value));
    progressRef.current = next;
    setProgress(next);
  }, []);

  const settle = useCallback(() => {
    const committed = progressRef.current >= SWIPE_COMMIT_AT;
    endedAtRef.current = Date.now();
    apply(0);
    setIsDragging(false);
    if (committed) onCommit();
  }, [apply, onCommit]);

  useEffect(() => {
    if (enabled) return;
    pointerRef.current = null;
    activeRef.current = false;
    wheelRef.current = 0;
    apply(0);
    setIsDragging(false);
  }, [enabled, apply]);

  useEffect(() => () => window.clearTimeout(wheelTimerRef.current), []);

  function onPointerDown(event: React.PointerEvent) {
    if (!enabled) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pointerRef.current = event.pointerId;
    originRef.current = { x: event.clientX, y: event.clientY };
    activeRef.current = false;
  }

  function onPointerMove(event: React.PointerEvent) {
    if (!enabled || pointerRef.current !== event.pointerId) return;

    const travel = event.clientX - originRef.current.x;
    const drift = Math.abs(event.clientY - originRef.current.y);

    if (!activeRef.current) {
      if (travel <= SWIPE_START_PX) return;
      if (drift > travel) {
        pointerRef.current = null;
        return;
      }
      activeRef.current = true;
      setIsDragging(true);
      capture(event);
    }

    apply((travel - SWIPE_START_PX) / SWIPE_RANGE_PX);
  }

  function onPointerUp(event: React.PointerEvent) {
    if (pointerRef.current !== event.pointerId) return;
    pointerRef.current = null;
    if (!activeRef.current) return;
    activeRef.current = false;
    release(event);
    settle();
  }

  function onWheel(event: React.WheelEvent) {
    if (!enabled || activeRef.current) return;
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;

    const travel = -event.deltaX;
    if (travel <= 0 && wheelRef.current <= 0) return;

    wheelRef.current = Math.max(0, wheelRef.current + travel);
    apply(wheelRef.current / SWIPE_RANGE_PX);

    window.clearTimeout(wheelTimerRef.current);
    wheelTimerRef.current = window.setTimeout(() => {
      wheelRef.current = 0;
      settle();
    }, WHEEL_SETTLE_MS);
  }

  /** A drag emits a trailing click; ignore only that one, never a later tap. */
  function consumeDragClick() {
    return Date.now() - endedAtRef.current < CLICK_SUPPRESS_MS;
  }

  return {
    progress,
    isDragging,
    consumeDragClick,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onWheel,
    },
  };
}
