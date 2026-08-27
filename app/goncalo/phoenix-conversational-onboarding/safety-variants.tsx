'use client';

// Variants:
//   panel — A Full screen: original continuity panel (no sheet)
//   offer — B Direct sheet: dim the prior session-offer screen
//   line  — C Conversation to sheet: stream the safety line first, then the sheet
//   orb   — D Orb to sheet: quiet centered orb, then the sheet is the only task
// Dismiss for B/C/D is locked to advance-now: sheet down, then the flow continues.

export type SafetyBackdrop = 'panel' | 'offer' | 'line' | 'orb';

export const SAFETY_BACKDROPS: {
  key: SafetyBackdrop;
  letter: 'A' | 'B' | 'C' | 'D';
  name: string;
}[] = [
  { key: 'panel', letter: 'A', name: 'Full screen' },
  { key: 'offer', letter: 'B', name: 'Direct sheet' },
  { key: 'line', letter: 'C', name: 'Conversation to sheet' },
  { key: 'orb', letter: 'D', name: 'Orb to sheet' },
];

export const DEFAULT_SAFETY_BACKDROP: SafetyBackdrop = 'panel';

function isBackdrop(value: string | null): value is SafetyBackdrop {
  return (
    value === 'panel' ||
    value === 'offer' ||
    value === 'line' ||
    value === 'orb'
  );
}

export function readSafetyBackdrop(): SafetyBackdrop {
  if (typeof window === 'undefined') return DEFAULT_SAFETY_BACKDROP;
  const backdrop = new URLSearchParams(window.location.search).get('backdrop');
  return isBackdrop(backdrop) ? backdrop : DEFAULT_SAFETY_BACKDROP;
}

export function writeSafetyBackdrop(backdrop: SafetyBackdrop) {
  const url = new URL(window.location.href);
  url.searchParams.set('backdrop', backdrop);
  url.searchParams.delete('dismiss');
  window.history.replaceState({}, '', url);
}

export function safetyBackdropName(key: SafetyBackdrop) {
  const item = SAFETY_BACKDROPS.find((entry) => entry.key === key);
  return item ? `${item.letter} — ${item.name}` : key;
}
