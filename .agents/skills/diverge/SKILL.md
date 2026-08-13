---
name: diverge
description: Generate multiple structurally-different UI variants in a single artifact, switchable via a floating bottom bar, so a designer can flip between them in the browser and either commit to one or cherry-pick parts from several. Use when the user asks to "explore approaches," "see a few options," "try different layouts," "show me variations," or anything else that suggests they want to see the design problem solved more than one way before committing.
---

# Diverge

Spin up N structurally-different takes on a design problem inside a single artifact, with a floating switcher to flip between them. The designer flips through, picks one to keep iterating on, or asks for a Frankenstein ("B's left rail with C's detail panel") in the next turn.

## When to use this

- "What should this dashboard look like?"
- "Show me a few options for the settings screen."
- "I want to explore some directions for this onboarding flow."
- "Try different layouts for the member detail page."

If the question is "make this prettier" or "fix this bug" or "what state should this hold" — wrong skill. This is for genuine divergence, not tweaks.

## Process

### 1. Pick scope and N

**Scope** is either _whole-screen_ (different page layouts) or _component_ (different takes on a single piece — a card, a nav, a form). Both work; the divergence axes differ. Whole-screen variants disagree about layout and information hierarchy; component variants disagree about interaction model and affordance.

**N** defaults to 3. Cap at 5 — beyond that, variants stop being radically different and start being noise.

### 2. Name the axes of divergence before drafting

This is the most important step and the easiest to skip. The failure mode of this skill is producing three variants that are secretly the same idea with different colors.

Before drafting any variant, write down — in a comment at the top of the artifact — what each variant is going to disagree about. Be specific. A divergence axis is something structural the variants take different positions on. Examples:

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
- Real divergence on the axes named in step 2

Variants can share trivial primitives (a `Button` component, an icon set) but should not share a `Layout` wrapper or anything that constrains structure. The point of the exercise is for variants to be free to throw out the layout.

### 4. Wire the switcher

A single switcher at the route level reads `?variant=` from the URL and renders the matching component:

```jsx
const variant =
  new URLSearchParams(window.location.search).get('variant') ?? 'A';
return (
  <>
    {variant === 'A' && <VariantA {...data} />}
    {variant === 'B' && <VariantB {...data} />}
    {variant === 'C' && <VariantC {...data} />}
    <VariantSwitcher variants={['A', 'B', 'C']} current={variant} />
  </>
);
```

Using `?variant=` (rather than React state) means the URL is shareable and reload-stable — the designer can paste a link to "the version with the sidebar."

### 5. Build the floating switcher bar

A small fixed-position bar at bottom-center with three pieces:

- **Left arrow** — cycles to the previous variant (wraps around)
- **Label** — shows the current variant key plus its short name, e.g. `B — Top tabs, card grid`
- **Right arrow** — cycles forward (wraps around)

Behavior:

- Clicking an arrow updates the URL search param and re-renders. Use `history.replaceState` (or the artifact's router equivalent) so back-button history doesn't fill up with variant flips.
- Keyboard: `←` and `→` arrow keys also cycle. Don't intercept arrow keys when an `<input>`, `<textarea>`, or `[contenteditable]` element is focused — the designer might be typing in a form inside a variant.
- Visually distinct from the design being evaluated — high-contrast pill, subtle shadow, clearly "chrome" rather than "content." It should be obvious that the bar is not part of any variant.

### 6. Hand off

Surface the variant keys and names in the response so the designer knows what they're flipping between. Expect one of two follow-ups:

- _"I want to keep iterating on B"_ — next turn drops the others and works on B.
- _"Give me B's left rail with C's detail panel"_ — next turn synthesizes a new variant from named parts.

## Anti-patterns

- **Recoloring as "variants."** Three takes that differ only in palette, spacing, or copy are not variants — they're a tweak. Real variants disagree about structure.
- **Sharing a** `<Layout>` **wrapper across variants.** Defeats the point. Each variant should be free to throw out the layout entirely.
- **Variants that converge mid-draft.** If A and B are starting to look alike, stop and redo one. Don't ship a near-duplicate.
- **Skipping step 2.** If the axes of divergence aren't written down before drafting, the variants will quietly collapse into the same idea three times.
- **Replacing existing variants.** When a new direction emerges (e.g. content-first sequencing), add it as a new variant key — don't overwrite labels, delete files, or repurpose A–D slots that already hold a design exploration.
- **More than 5 variants.** Past five, the designer can't hold them in their head and the exercise stops working.
