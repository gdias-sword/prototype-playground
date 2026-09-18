'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

const SNAP_ATTR = 'data-snap-turn';
const PIN_THRESHOLD_PX = 8;
const SNAP_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

function nearestTurnElement(node: HTMLElement) {
  const centerY = node.getBoundingClientRect().top + node.clientHeight / 2;
  const items = node.querySelectorAll<HTMLElement>(`[${SNAP_ATTR}]`);

  let best: HTMLElement | null = null;
  let bestDistance = Infinity;

  for (const item of items) {
    const rect = item.getBoundingClientRect();
    const itemCenter = rect.top + rect.height / 2;
    const distance = Math.abs(itemCenter - centerY);
    if (distance >= bestDistance) continue;
    bestDistance = distance;
    best = item;
  }

  return best;
}

function scrollTopToCenter(node: HTMLElement, item: HTMLElement) {
  const nodeRect = node.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  const itemCenter = itemRect.top + itemRect.height / 2;
  const nodeCenter = nodeRect.top + nodeRect.height / 2;
  return node.scrollTop + (itemCenter - nodeCenter);
}

export interface StackSnapFocusOptions {
  /** Update focused line while scrolling. Off = only on scroll end. */
  liveFocus?: boolean;
}

export function useStackSnapFocus(
  turnIds: string[],
  options: StackSnapFocusOptions = {},
) {
  const liveFocus = options.liveFocus ?? true;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [snappedId, setSnappedId] = useState<string | null>(null);
  const [snapPad, setSnapPad] = useState(0);
  const pinnedRef = useRef(true);
  const rafRef = useRef(0);
  const snappingRef = useRef(false);
  const draggingRef = useRef(false);

  const measurePad = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;
    setSnapPad(Math.max(0, Math.round(node.clientHeight / 2)));
  }, []);

  const updateSnapped = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;
    const best = nearestTurnElement(node);
    const bestId = best?.getAttribute(SNAP_ATTR) ?? null;
    setSnappedId((current) => (current === bestId ? current : bestId));
  }, []);

  const snapToElement = useCallback(
    (item: HTMLElement, behavior: ScrollBehavior = 'smooth') => {
      const node = scrollRef.current;
      if (!node) return;

      const targetTop = scrollTopToCenter(node, item);
      const lastId = turnIds.at(-1);
      const itemId = item.getAttribute(SNAP_ATTR);
      pinnedRef.current = itemId === lastId;

      snappingRef.current = true;
      node.scrollTo({ top: targetTop, behavior });
      setSnappedId(itemId);

      if (behavior === 'auto') {
        snappingRef.current = false;
        return;
      }

      window.setTimeout(() => {
        snappingRef.current = false;
      }, 420);
    },
    [turnIds],
  );

  const snapToNearest = useCallback(
    (behavior: ScrollBehavior = 'smooth') => {
      const node = scrollRef.current;
      if (!node || draggingRef.current) return;
      const best = nearestTurnElement(node);
      if (!best) return;

      const targetTop = scrollTopToCenter(node, best);
      if (Math.abs(targetTop - node.scrollTop) < 1) {
        updateSnapped();
        return;
      }

      snapToElement(best, behavior);
    },
    [snapToElement, updateSnapped],
  );

  const scrollToPresent = useCallback(
    (behavior: ScrollBehavior = 'auto') => {
      const node = scrollRef.current;
      if (!node) return;
      const lastId = turnIds.at(-1);
      if (!lastId) return;

      const target = node.querySelector<HTMLElement>(
        `[${SNAP_ATTR}="${lastId}"]`,
      );
      if (!target) return;
      snapToElement(target, behavior);
    },
    [snapToElement, turnIds],
  );

  const onScroll = useCallback(() => {
    const node = scrollRef.current;
    if (!node || snappingRef.current) return;

    const atBottom =
      node.scrollTop >=
      node.scrollHeight - node.clientHeight - PIN_THRESHOLD_PX;
    if (atBottom) pinnedRef.current = true;

    if (!liveFocus) return;

    window.cancelAnimationFrame(rafRef.current);
    rafRef.current = window.requestAnimationFrame(updateSnapped);
  }, [liveFocus, updateSnapped]);

  useLayoutEffect(() => {
    measurePad();
    const node = scrollRef.current;
    if (!node) return;

    function onScrollEnd() {
      snapToNearest('smooth');
    }

    node.addEventListener('scrollend', onScrollEnd);

    const observer = new ResizeObserver(() => {
      measurePad();
      if (pinnedRef.current) scrollToPresent('auto');
      updateSnapped();
    });
    observer.observe(node);
    return () => {
      node.removeEventListener('scrollend', onScrollEnd);
      observer.disconnect();
    };
  }, [measurePad, scrollToPresent, snapToNearest, updateSnapped]);

  useLayoutEffect(() => {
    if (!pinnedRef.current) return;
    scrollToPresent('auto');
    updateSnapped();
  }, [turnIds, scrollToPresent, updateSnapped]);

  useEffect(() => () => window.cancelAnimationFrame(rafRef.current), []);

  return {
    scrollRef,
    snappedId,
    snapPad,
    onScroll,
    scrollHandlers: {
      onPointerDown: () => {
        draggingRef.current = true;
        pinnedRef.current = false;
      },
      onPointerUp: () => {
        draggingRef.current = false;
        window.setTimeout(() => snapToNearest('smooth'), 16);
      },
      onPointerCancel: () => {
        draggingRef.current = false;
        snapToNearest('smooth');
      },
    },
    scrollToTurn: (turnId: string) => {
      const node = scrollRef.current;
      if (!node) return;
      const target = node.querySelector<HTMLElement>(
        `[${SNAP_ATTR}="${turnId}"]`,
      );
      if (!target) return;
      snapToElement(target, 'smooth');
    },
  };
}

const SNAP_TRANSITION = `opacity 320ms ${SNAP_EASE}, transform 320ms ${SNAP_EASE}`;

/** iOS picker–style falloff from the centered snap line. */
export function snapStackShellStyle({
  turnId,
  snappedId,
  index,
  snappedIndex,
}: {
  turnId: string;
  snappedId: string | null;
  index: number;
  snappedIndex: number;
}) {
  const distance =
    snappedIndex < 0
      ? turnId === snappedId
        ? 0
        : 2
      : Math.abs(index - snappedIndex);

  if (distance === 0) {
    return {
      opacity: 1,
      transform: 'scale(1)',
      transition: SNAP_TRANSITION,
    };
  }

  return {
    opacity: Math.max(0.2, 0.82 - distance * 0.22),
    transform: `scale(${Math.max(0.92, 1 - distance * 0.03)})`,
    transition: SNAP_TRANSITION,
  };
}

/** Snapped line full size; everything else 20% opacity and 0.92 scale. */
export function snapStackFlatShellStyle({
  turnId,
  snappedId,
}: {
  turnId: string;
  snappedId: string | null;
}) {
  const isSnapped = snappedId === turnId;

  return {
    opacity: isSnapped ? 1 : 0.2,
    transform: isSnapped ? 'scale(1)' : 'scale(0.92)',
    transition: SNAP_TRANSITION,
  };
}
