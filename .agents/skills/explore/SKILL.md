---
name: explore
description: Explore multiple UI approaches on an existing prototype, switchable via a floating bottom bar. Use when the user asks to explore, diverge, or wants a design problem solved more than one way before committing.
disable-model-invocation: true
---

# Explore

Spin up N structurally-different takes on a design problem with a floating switcher to flip between them.

## Where this lives

- **Work in the existing prototype** (`app/<username>/<prototype>/`). Do not scaffold a sibling prototype.
- Do not add `/explore`, `/explorations/`, or `?explore=` routes or params. Those are redundant once the work is a preview deploy.
- The only exploration-related query param is `?variant=`, for the switcher.

## When to use this

- "What should this dashboard look like?"
- "Show me a few options for the settings screen."
- "I want to explore some directions for this onboarding flow."
- "Try different layouts for the member detail page."

If the question is "make this prettier" or "fix this bug" or "what state should this hold" — wrong skill. This is for genuine structural alternatives, not tweaks.

## Process

### 1. Pick scope and N

**Scope** is either _whole-screen_ (different page layouts) or _component_ (different takes on a single piece — a card, a nav, a form). Both work; the axes differ. Whole-screen variants disagree about layout and information hierarchy; component variants disagree about interaction model and affordance.

**N** defaults to 3. Cap at 5 — beyond that, variants stop being radically different and start being noise.

### 2. Name the axes before drafting

This is the most important step and the easiest to skip. The failure mode is producing three variants that are secretly the same idea with different colors.

Before drafting any variant, write down — in a comment at the top of the artifact — what each variant is going to disagree about. Be specific. An axis is something structural the variants take different positions on. Examples:

- How the primary task is initiated (button vs search vs direct manipulation vs command palette)
- What's the biggest thing on screen, and what's tucked away
- Navigation model (tabs / sidebar / single scroll / wizard)
- Density (sparse and focused vs information-rich)
- The mental metaphor the UI evokes (inbox / spreadsheet / feed / workbench / map)
- Where state lives visually (single canvas vs split panes vs modal flow)

Each variant should commit to a _different_ axis or take a clearly different position on the same axis. Write it down explicitly:

```
// Variants:
// A — sidebar nav, dense table, edit-in-place
// B — top tabs, card grid, modal-based editing
// C — command palette as primary affordance, minimal chrome
```

If two variants come out looking similar mid-draft, stop and redo one with explicit "do not use the layout/affordance the other variant used" guidance.

### 3. Draft the variants

Each variant is a clean component export — `VariantA`, `VariantB`, `VariantC`.

Hold each variant to:

- The data and purpose of the page (variants disagree about presentation, not about what the page is _for_)
- Whatever styling system the artifact is using (Tailwind, plain CSS, etc.)
- Real disagreement on the axes named in step 2

Variants can share trivial primitives (a `Button` component, an icon set) but should not share a `Layout` wrapper or anything that constrains structure. The point of the exercise is for variants to be free to throw out the layout.

Prefer extending the parent experience over copying it. Fork files only when the exploration truly needs a different structure; do not clone the whole orchestration layer as a new prototype.

### 4. Wire the shared switcher

Import `VariantSwitcher` from `@/components/variant-switcher`. Do not build a local bar, URL handler, or keyboard shortcut — the platform component should apply globally.

Wire it at the route level so each variant is a clean component export:

```tsx
import { VariantSwitcher } from '@/components/variant-switcher';

export default function Page() {
  return (
    <VariantSwitcher
      variants={[
        { id: 'A', label: 'Sidebar nav, dense table' },
        { id: 'B', label: 'Top tabs, card grid' },
        { id: 'C', label: 'Command palette' },
      ]}
    >
      {(variant) => (
        <>
          {variant === 'A' && <VariantA {...data} />}
          {variant === 'B' && <VariantB {...data} />}
          {variant === 'C' && <VariantC {...data} />}
        </>
      )}
    </VariantSwitcher>
  );
}
```

Using `?variant=` (rather than React state) means the URL is shareable and reload-stable — the designer can paste a link to "the version with the sidebar."

The shareable link is:

```
<preview-deployment-url>/<username>/<parent-slug>?variant=C
```

Not `...?explore=…&variant=C`. The preview host already denotes the exploration; `variant` only picks which option inside it.

Labels in the `variants` array should match the short names written in step 2 so the bar reads e.g. `B — Top tabs, card grid`.

### 5. Share and hand off

- Isolation is the **preview deployment**, not a branch, PR, or new prototype. Leave production on the last promoted deployment; do not promote the exploration.
- Branches and PRs are optional and only when the user explicitly asks for them.
- Surface the variant keys and names in the response so the designer knows what they're flipping between.

Expect one of two follow-ups:

- _"I want to keep iterating on B"_ — next turn drops the others and works on B.
- _"Give me B's left rail with C's detail panel"_ — next turn synthesizes a new variant from named parts.

When an approach wins, fold it into the parent experience. Do not leave a permanent sibling prototype behind.

## Anti-patterns

- **New gallery prototype per exploration.** Do not create `app/<user>/<parent>-<topic>/` (or `*-diverge`) to get a distinct URL. The preview deployment already has one.
- **Reimplementing the switcher locally.** Always import `VariantSwitcher` from `@/components/variant-switcher`. Do not copy the floating bar, `?variant=` handling, or keyboard cycling into the prototype.
- `?explore=` **or** `/explorations/` **routes.** Unnecessary. The deployment hash identifies the exploration; `?variant=` identifies the option.
- **Promoting the exploration to production.** Prod stays on the last promoted deployment until something is ready to keep.
- **Recoloring as "variants."** Three takes that differ only in palette, spacing, or copy are not variants — they're a tweak. Real variants disagree about structure.
- **Sharing a** `<Layout>` **wrapper across variants.** Defeats the point. Each variant should be free to throw out the layout entirely.
- **Variants that converge mid-draft.** If A and B are starting to look alike, stop and redo one. Don't ship a near-duplicate.
- **Skipping step 2.** If the axes aren't written down before drafting, the variants will quietly collapse into the same idea three times.
- **Replacing existing variants.** When a new direction emerges (e.g. content-first sequencing), add it as a new variant key — don't overwrite labels, delete files, or repurpose A–D slots that already hold a design exploration.
- **More than 5 variants.** Past five, the designer can't hold them in their head and the exercise stops working.
