export interface MeasuredBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface MeasuredGap extends MeasuredBox {
  size: number;
}

interface Edges {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

const MAX_BOXES = 200;

export function measureMarquee(marquee: MeasuredBox): {
  boxes: MeasuredBox[];
  gaps: MeasuredGap[];
} {
  const region = edges(marquee);
  const boxes = collectBoxes(region).map(toBox);
  const gaps = gapsBetween(boxes.map(edges)).filter((gap) =>
    centerInside(edges(gap), region),
  );
  return { boxes, gaps };
}

function collectBoxes(marquee: Edges): Edges[] {
  const boxes: Edges[] = [];
  for (const element of document.body.querySelectorAll('*')) {
    if (!qualifies(element, marquee)) continue;
    boxes.push(edges(element.getBoundingClientRect()));
  }
  return boxes.slice(0, MAX_BOXES);
}

function qualifies(element: Element, marquee: Edges): boolean {
  if (element === document.body || element === document.documentElement) {
    return false;
  }
  const tag = element.tagName;
  if (
    tag === 'SCRIPT' ||
    tag === 'STYLE' ||
    tag === 'LINK' ||
    tag === 'NOSCRIPT'
  ) {
    return false;
  }
  if (
    element.closest('[data-prototype-chrome], [data-comment-ui], nextjs-portal')
  ) {
    return false;
  }
  if (element.closest('svg') && element.tagName !== 'svg') return false;
  const rect = element.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return false;
  if (!centerInside(rect, marquee)) return false;
  if (isInvisible(element)) return false;
  return !isPassThrough(element, rect);
}

function isInvisible(element: Element): boolean {
  if (!('checkVisibility' in element)) return false;
  return !element.checkVisibility({
    opacityProperty: true,
    visibilityProperty: true,
  });
}

function isPassThrough(element: Element, rect: DOMRect): boolean {
  const boxed = [...element.children].filter((child) => {
    const childRect = child.getBoundingClientRect();
    return childRect.width >= 1 && childRect.height >= 1;
  });
  if (boxed.length !== 1) return false;
  return sameBox(rect, boxed[0].getBoundingClientRect());
}

function sameBox(a: DOMRect, b: DOMRect): boolean {
  return (
    Math.round(a.left) === Math.round(b.left) &&
    Math.round(a.top) === Math.round(b.top) &&
    Math.round(a.width) === Math.round(b.width) &&
    Math.round(a.height) === Math.round(b.height)
  );
}

function centerInside(rect: DOMRect | Edges, marquee: Edges): boolean {
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  return (
    x >= marquee.left &&
    x <= marquee.right &&
    y >= marquee.top &&
    y <= marquee.bottom
  );
}

function gapsBetween(boxes: Edges[]): MeasuredGap[] {
  const gaps: MeasuredGap[] = [];
  const seen = new Set<string>();

  for (const box of boxes) {
    const nearest: Partial<Record<Side, { distance: number; other: Edges }>> =
      {};
    for (const other of boxes) {
      if (other === box) continue;
      consider(nearest, box, other);
    }
    for (const side of ['left', 'right', 'top', 'bottom'] as const) {
      const match = nearest[side];
      if (!match) continue;
      const gap = gapOn(side, box, match.other, match.distance);
      const key = [
        Math.round(gap.left),
        Math.round(gap.top),
        Math.round(gap.width),
        Math.round(gap.height),
      ].join(':');
      if (seen.has(key)) continue;
      seen.add(key);
      gaps.push(gap);
    }
  }

  return gaps;
}

type Side = 'left' | 'right' | 'top' | 'bottom';

function consider(
  nearest: Partial<Record<Side, { distance: number; other: Edges }>>,
  box: Edges,
  other: Edges,
) {
  if (contains(other, box)) {
    offer(nearest, 'left', box.left - other.left, other);
    offer(nearest, 'right', other.right - box.right, other);
    offer(nearest, 'top', box.top - other.top, other);
    offer(nearest, 'bottom', other.bottom - box.bottom, other);
    return;
  }
  if (contains(box, other)) return;

  const vertical = overlap(box.top, box.bottom, other.top, other.bottom);
  const horizontal = overlap(box.left, box.right, other.left, other.right);
  if (vertical >= 4 && other.right <= box.left + 0.5) {
    offer(nearest, 'left', box.left - other.right, other);
  }
  if (vertical >= 4 && other.left >= box.right - 0.5) {
    offer(nearest, 'right', other.left - box.right, other);
  }
  if (horizontal >= 4 && other.bottom <= box.top + 0.5) {
    offer(nearest, 'top', box.top - other.bottom, other);
  }
  if (horizontal >= 4 && other.top >= box.bottom - 0.5) {
    offer(nearest, 'bottom', other.top - box.bottom, other);
  }
}

function offer(
  nearest: Partial<Record<Side, { distance: number; other: Edges }>>,
  side: Side,
  distance: number,
  other: Edges,
) {
  if (distance < 1) return;
  const current = nearest[side];
  if (!current || distance < current.distance - 0.5) {
    nearest[side] = { distance, other };
  }
}

function gapOn(
  side: Side,
  box: Edges,
  other: Edges,
  distance: number,
): MeasuredGap {
  if (side === 'left' || side === 'right') {
    const top = Math.max(box.top, contains(other, box) ? box.top : other.top);
    const bottom = Math.min(
      box.bottom,
      contains(other, box) ? box.bottom : other.bottom,
    );
    return {
      left: side === 'left' ? box.left - distance : box.right,
      top,
      width: distance,
      height: Math.max(1, bottom - top),
      size: distance,
    };
  }
  const left = Math.max(box.left, contains(other, box) ? box.left : other.left);
  const right = Math.min(
    box.right,
    contains(other, box) ? box.right : other.right,
  );
  return {
    left,
    top: side === 'top' ? box.top - distance : box.bottom,
    width: Math.max(1, right - left),
    height: distance,
    size: distance,
  };
}

function contains(outer: Edges, inner: Edges): boolean {
  return (
    outer.left <= inner.left + 0.5 &&
    outer.top <= inner.top + 0.5 &&
    outer.right >= inner.right - 0.5 &&
    outer.bottom >= inner.bottom - 0.5 &&
    (outer.width - inner.width > 1 || outer.height - inner.height > 1)
  );
}

function overlap(
  start: number,
  end: number,
  otherStart: number,
  otherEnd: number,
): number {
  return Math.min(end, otherEnd) - Math.max(start, otherStart);
}

function edges(rect: MeasuredBox | DOMRect): Edges {
  return {
    left: rect.left,
    top: rect.top,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    width: rect.width,
    height: rect.height,
  };
}

function toBox(rect: Edges): MeasuredBox {
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
}
