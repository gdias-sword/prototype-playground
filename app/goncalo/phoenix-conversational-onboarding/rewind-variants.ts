export const REWIND_VARIANTS = [
  { key: 'A', name: 'Pull to remember' },
  { key: 'B', name: 'Living answers' },
  { key: 'C', name: 'Say so' },
  { key: 'D', name: 'Swipe back' },
  { key: 'E', name: 'Snap answers' },
  { key: 'F', name: 'Snap stack' },
  { key: 'G', name: 'Snap stack flat' },
  { key: 'H', name: 'Pull snap stack' },
] as const;

export type RewindVariantKey = (typeof REWIND_VARIANTS)[number]['key'];

export const DEFAULT_REWIND_VARIANT: RewindVariantKey = 'A';

export function normalizeVariant(value: string | null): RewindVariantKey {
  const match = REWIND_VARIANTS.find(
    (variant) => variant.key === value?.toUpperCase(),
  );
  return match?.key ?? DEFAULT_REWIND_VARIANT;
}

export function cycleVariant(current: RewindVariantKey, step: 1 | -1) {
  const index = REWIND_VARIANTS.findIndex((variant) => variant.key === current);
  const next = (index + step + REWIND_VARIANTS.length) % REWIND_VARIANTS.length;
  return REWIND_VARIANTS[next].key;
}

export function variantName(key: RewindVariantKey) {
  return REWIND_VARIANTS.find((variant) => variant.key === key)!.name;
}
