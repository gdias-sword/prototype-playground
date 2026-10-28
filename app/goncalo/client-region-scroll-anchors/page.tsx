'use client';

// Variants:
// A — Section index: one scroll, sticky region headers, edge index to jump
// B — Region scope: one region on screen, scroll kept per region
// C — Context anchor: sticky current region opens a jump menu
// D — Region filters: A–Z list, chips include or exclude regions
// E — Sticky headers: one scroll, sticky region headers, no edge index
// F — Region progress: E, with the region border filling as its list is viewed
// G — Next region: E, with an arrow that scrolls to the next region

import { VariantSwitcher } from '@/components/variant-switcher';
import type { ReactNode } from 'react';
import { ContextAnchor } from './context-anchor';
import { RegionAdvance } from './region-advance';
import { RegionFilters } from './region-filters';
import { RegionScope } from './region-scope';
import { SectionIndex } from './section-index';

function Phone({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background-neutral-inverse rounded-[48px] p-2.5 shadow-xl">
      <div className="h-[812px] w-[375px] overflow-hidden rounded-[38px]">
        {children}
      </div>
    </div>
  );
}

export default function ClientRegionScrollAnchors() {
  return (
    <VariantSwitcher
      variants={[
        { id: 'A', label: 'Section index' },
        { id: 'B', label: 'Region scope' },
        { id: 'C', label: 'Context anchor' },
        { id: 'D', label: 'Region filters' },
        { id: 'E', label: 'Sticky headers' },
        { id: 'F', label: 'Region progress' },
        { id: 'G', label: 'Next region' },
      ]}
    >
      {(variant) => (
        <main className="bg-background-neutral-subtle flex min-h-dvh items-start justify-center px-8 pt-10 pb-28">
          <Phone>
            {variant === 'A' && <SectionIndex />}
            {variant === 'B' && <RegionScope />}
            {variant === 'C' && <ContextAnchor />}
            {variant === 'D' && <RegionFilters />}
            {variant === 'E' && <RegionAdvance />}
            {variant === 'F' && <RegionAdvance progress />}
            {variant === 'G' && <RegionAdvance chevron />}
          </Phone>
        </main>
      )}
    </VariantSwitcher>
  );
}
