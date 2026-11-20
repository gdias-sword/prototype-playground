'use client';

export interface Tuning {
  stepDuration: number;
  stepDistance: number;
  headerDelay: number;
  contentDelay: number;
  footerDelay: number;
  rowStagger: number;
}

const DEFAULTS: Tuning = {
  stepDuration: 1.6,
  stepDistance: 40,
  headerDelay: 0.2,
  contentDelay: 0.6,
  footerDelay: 1.2,
  rowStagger: 0.2,
};

export function useTuning() {
  return DEFAULTS;
}
