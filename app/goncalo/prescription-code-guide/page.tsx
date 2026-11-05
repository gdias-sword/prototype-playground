'use client';

// Variants:
// A — persistent split: the annotated guia stays beside the form, and focus links a field to its region
// B — field lens: the form stays one column; each field opens a crop of only that code
// C — the paper leads: one spotlighted code at a time, and the input follows the guia
// D — example on request: the form is unchanged; one link opens the full annotated guia
// E — info sheet: an icon beside each label opens that code's placement in a bottom sheet on mobile and a centered modal on desktop
// F — zoom spotlight: the split guia dims and zooms to the field in focus
// G — zoom sheet: the info sheet opens on the full guia, eases into that code, holds, then eases back

import { VariantSwitcher } from '@/components/variant-switcher';
import { VariantA } from './variant-a';
import { VariantB } from './variant-b';
import { VariantC } from './variant-c';
import { VariantD } from './variant-d';
import { VariantE } from './variant-e';
import { VariantF } from './variant-f';
import { VariantG } from './variant-g';

const variants = [
  { id: 'A', label: 'Split guide' },
  { id: 'B', label: 'Field lens' },
  { id: 'C', label: 'Paper leads' },
  { id: 'D', label: 'Example on request' },
  { id: 'E', label: 'Info sheet' },
  { id: 'F', label: 'Zoom spotlight' },
  { id: 'G', label: 'Zoom sheet' },
];

export default function PrescriptionCodeGuide() {
  return (
    <VariantSwitcher variants={variants}>
      {(variant) => (
        <>
          {variant === 'A' && <VariantA />}
          {variant === 'B' && <VariantB />}
          {variant === 'C' && <VariantC />}
          {variant === 'D' && <VariantD />}
          {variant === 'E' && <VariantE />}
          {variant === 'F' && <VariantF />}
          {variant === 'G' && <VariantG />}
        </>
      )}
    </VariantSwitcher>
  );
}
