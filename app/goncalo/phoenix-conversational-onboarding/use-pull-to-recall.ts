'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { capture, release } from './pointer-capture';
import { RECALL_OPEN_AT, RECALL_PULL_PX } from './recall';

const DRAG_START_PX = 6;
const WHEEL_SETTLE_MS = 160;
const CLICK_SUPPRESS_MS = 300;

interface PullToRecallOptions {
  enabled: boolean;
  isOpen: boolean;
  atBottom: () => boolean;
  onOpen: () => void;
  onClose: () => void;
}

export function usePullToRecall({
  enabled,
  isOpen,
  atBottom,
  onOpen,
  onClose,
}: PullToRecallOptions) {
  const [pull, setPull] = useState(0);
  const [dismiss, setDismiss] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const pullRef = useRef(0);
  const dismissRef = useRef(0);
  const pointerRef = useRef<number | null>(null);
  const originRef = useRef(0);
  const activeRef = useRef(false);
  const endedAtRef = useRef(0);
  const wheelRef = useRef(0);
  const wheelTimerRef = useRef(0);

  const apply = useCallback(
    (value: number) => {
      const next = Math.min(1, Math.max(0, value));
      if (isOpen) {
        dismissRef.current = next;
        setDismiss(next);
        return;
      }
      pullRef.current = next;
      setPull(next);
    },
    [isOpen],
  );

  const settle = useCallback(() => {
    const committed =
      (isOpen ? dismissRef.current : pullRef.current) >= RECALL_OPEN_AT;
    pullRef.current = 0;
    dismissRef.current = 0;
    endedAtRef.current = Date.now();
    setPull(0);
    setDismiss(0);
    setIsDragging(false);
    if (!committed) return;
    if (isOpen) onClose();
    else onOpen();
  }, [isOpen, onClose, onOpen]);

  useEffect(() => {
    if (enabled) return;
    pointerRef.current = null;
    activeRef.current = false;
    wheelRef.current = 0;
    pullRef.current = 0;
    dismissRef.current = 0;
    setPull(0);
    setDismiss(0);
    setIsDragging(false);
  }, [enabled]);

  useEffect(() => () => window.clearTimeout(wheelTimerRef.current), []);

  function onPointerDown(event: React.PointerEvent) {
    if (!enabled) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pointerRef.current = event.pointerId;
    originRef.current = event.clientY;
    activeRef.current = false;
  }

  function onPointerMove(event: React.PointerEvent) {
    if (!enabled || pointerRef.current !== event.pointerId) return;

    // Opening reaches back in time (finger down); dismissing returns to the present (finger up).
    const travel = isOpen
      ? originRef.current - event.clientY
      : event.clientY - originRef.current;

    if (!activeRef.current) {
      if (travel <= DRAG_START_PX) return;
      if (isOpen && !atBottom()) return;
      activeRef.current = true;
      setIsDragging(true);
      capture(event);
    }

    apply((travel - DRAG_START_PX) / RECALL_PULL_PX);
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
    const travel = isOpen ? event.deltaY : -event.deltaY;
    if (travel <= 0 && wheelRef.current <= 0) return;
    if (isOpen && !atBottom()) return;

    wheelRef.current = Math.max(0, wheelRef.current + travel);
    apply(wheelRef.current / RECALL_PULL_PX);

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
    pull,
    dismiss,
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
