'use client';

// Variants:
// A — persistent split: the annotated guia stays beside the form, and focus links a field to its region
// B — field lens: the form stays one column; each field opens a crop of only that code
// C — the paper leads: one spotlighted code at a time, and the input follows the guia
// D — example on request: the form is unchanged; one link opens the full annotated guia
// E — zoom spotlight: the split guia dims and zooms to the field in focus
// F — zoom sheet: the sheet opens on the full guia, eases into that code, holds, then eases back

import { VariantSwitcher } from '@/components/variant-switcher';
import { VariantA } from './variant-a';
import { VariantB } from './variant-b';
import { VariantC } from './variant-c';
import { VariantD } from './variant-d';
import { VariantE } from './variant-e';
import { VariantF } from './variant-f';

const variants = [
  { id: 'A', label: 'Split guide' },
  { id: 'B', label: 'Field lens' },
  { id: 'C', label: 'Paper leads' },
  { id: 'D', label: 'Example on request' },
  { id: 'E', label: 'Zoom spotlight' },
  { id: 'F', label: 'Zoom sheet' },
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
        </>
      )}
    </VariantSwitcher>
  );
}
