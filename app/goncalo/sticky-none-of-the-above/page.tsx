'use client';

import { VariantSwitcher } from '@/components/variant-switcher';
import { VariantA, VariantB, VariantC } from './variants';

export default function StickyNoneOfTheAbove() {
  return (
    <VariantSwitcher
      variants={[
        { id: 'A', label: 'Sticky dock, frosted glass' },
        { id: 'B', label: 'Sticky dock, mask fade' },
        { id: 'C', label: 'Pinned first' },
      ]}
    >
      {(variant) => (
        <>
          {variant === 'A' && <VariantA />}
          {variant === 'B' && <VariantB />}
          {variant === 'C' && <VariantC />}
        </>
      )}
    </VariantSwitcher>
  );
}
