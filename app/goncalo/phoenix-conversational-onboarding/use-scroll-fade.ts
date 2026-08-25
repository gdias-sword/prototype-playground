import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type DependencyList,
} from 'react';

export const SCROLL_FADE_THRESHOLD_PX = 4;

/**
 * Tracks whether a scrollable element is scrolled away from its top/bottom
 * edge, for driving the `data-fade-top`/`data-fade-bottom` attributes that
 * `.phoenix-chip-scroller` (motion.css) uses to mask its edges.
 */
export function useScrollFade<T extends HTMLElement = HTMLDivElement>(
  deps: DependencyList = [],
) {
  const scrollerRef = useRef<T>(null);
  const [fadeTop, setFadeTop] = useState(false);
  const [fadeBottom, setFadeBottom] = useState(false);

  const updateFades = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const { scrollTop, scrollHeight, clientHeight } = scroller;
    const overflow = scrollHeight - clientHeight > SCROLL_FADE_THRESHOLD_PX;

    setFadeTop(overflow && scrollTop > SCROLL_FADE_THRESHOLD_PX);
    setFadeBottom(
      overflow &&
        scrollTop + clientHeight < scrollHeight - SCROLL_FADE_THRESHOLD_PX,
    );
  }, []);

  useLayoutEffect(() => {
    updateFades();

    const scroller = scrollerRef.current;
    if (!scroller) return;

    const observer = new ResizeObserver(updateFades);
    observer.observe(scroller);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateFades, ...deps]);

  return { scrollerRef, fadeTop, fadeBottom, onScroll: updateFades };
}
