import { isAnchorSelector, type Anchor } from '@/playground/comment-model';

export interface DraftAnchor extends Anchor {
  left: number;
  top: number;
}

export function anchorFromClick(event: MouseEvent): DraftAnchor | null {
  const target = event.target;
  if (!(target instanceof Element)) return null;
  if (target.closest('[data-comment-ui]')) return null;
  if (target === document.body || target === document.documentElement)
    return null;

  const selector = selectorFor(target);
  if (!selector || !isAnchorSelector(selector)) return null;

  const rect = target.getBoundingClientRect();
  const x = rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0.5;
  const y = rect.height > 0 ? (event.clientY - rect.top) / rect.height : 0.5;

  return {
    selector,
    x: clamp(x),
    y: clamp(y),
    left: event.clientX,
    top: event.clientY,
  };
}

export function pinPosition(
  anchor: Anchor,
): { left: number; top: number } | null {
  const element = findAnchoredElement(anchor.selector);
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  return {
    left: rect.left + rect.width * anchor.x,
    top: rect.top + rect.height * anchor.y,
  };
}

function findAnchoredElement(selector: string): Element | null {
  if (!isAnchorSelector(selector)) return null;
  try {
    const element = document.querySelector(selector);
    if (!element || element.closest('[data-comment-ui]')) return null;
    return element;
  } catch {
    return null;
  }
}

function selectorFor(element: Element): string | null {
  const parts: string[] = [];
  let current: Element | null = element;
  while (current && current !== document.body) {
    if (current.hasAttribute('data-comment-ui')) return null;
    const parent: Element | null = current.parentElement;
    if (!parent) return null;
    const tag = current.tagName.toLowerCase();
    if (!/^[a-z][a-z0-9-]*$/.test(tag)) return null;
    let index = 1;
    for (const sibling of parent.children) {
      if (sibling === current) break;
      if (sibling.tagName === current.tagName) index += 1;
    }
    parts.unshift(`${tag}:nth-of-type(${index})`);
    current = parent;
  }
  if (current !== document.body || parts.length === 0) return null;
  return `body > ${parts.join(' > ')}`;
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}
