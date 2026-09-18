'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

export const ANSWER_SNAP_ROW_PX = 48;
export const ANSWER_SNAP_VISIBLE_ROWS = 5;

export function answerSnapWheelHeight() {
  return ANSWER_SNAP_ROW_PX * ANSWER_SNAP_VISIBLE_ROWS;
}

export function answerSnapPadRows() {
  return Math.floor(ANSWER_SNAP_VISIBLE_ROWS / 2);
}

function indexFromScroll(scrollTop: number) {
  return Math.max(0, Math.round(scrollTop / ANSWER_SNAP_ROW_PX));
}

export function useAnswerSnapWheel(itemCount: number) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const rafRef = useRef(0);

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const node = scrollRef.current;
    if (!node) return;
    const clamped = Math.min(itemCount - 1, Math.max(0, index));
    node.scrollTo({ top: clamped * ANSWER_SNAP_ROW_PX, behavior });
    setActiveIndex(clamped);
  }, [itemCount]);

  useLayoutEffect(() => {
    if (itemCount === 0) return;
    const latest = itemCount - 1;
    setActiveIndex(latest);
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = latest * ANSWER_SNAP_ROW_PX;
  }, [itemCount]);

  const onScroll = useCallback(() => {
    window.cancelAnimationFrame(rafRef.current);
    rafRef.current = window.requestAnimationFrame(() => {
      const node = scrollRef.current;
      if (!node || itemCount === 0) return;
      const next = Math.min(itemCount - 1, indexFromScroll(node.scrollTop));
      setActiveIndex((current) => (current === next ? current : next));
    });
  }, [itemCount]);

  useEffect(() => () => window.cancelAnimationFrame(rafRef.current), []);

  return { scrollRef, activeIndex, scrollToIndex, onScroll };
}
