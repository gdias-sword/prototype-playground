import type { PhoenixStep } from './phoenix-scene';

export const RECALL_PULL_PX = 116;
export const RECALL_OPEN_AT = 0.42;
export const RECALL_MS = 620;
export const RECALL_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

export function isRewindableStep(step?: PhoenixStep) {
  if (!step) return false;
  return step.kind !== 'guide' && step.kind !== 'ready';
}

export function lerp(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}
