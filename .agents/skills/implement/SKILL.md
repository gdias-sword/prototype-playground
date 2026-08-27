---
name: implement
description: Implement UI in a playground prototype using the Sword design system. Use when building, fleshing out, or coding a prototype screen or component.
---

# Implement

Before writing any code, read `design/globals.css`. It is the source of truth for all available design system tokens.

## Tokens

Map design values to their semantic token — never transcribe hex or pixel literals.

Match by **role**, not value:

- What is this color _for_? (background, text, border)
- Is it neutral or brand?
- What prominence? (default, faded, subtle, strong, inverse)

Use `[#hex]` or arbitrary values only when the design intentionally diverges from the token system — e.g. an illustration, a one-off gradient. Not for anything a token can cover.

## Components

Reach for a component from `@/design/components/` before building a custom one — if it covers the intent, use it. Check `button.tsx` for a reference implementation of correct token usage.

## Breakpoints

Every prototype must be responsive across breakpoints. Use the custom breakpoint values defined in `design/globals.css` to set responsive variants throughout the styling work.

If the reference design only covers one breakpoint, infer the others using standard responsive design heuristics: stack on mobile, expand on desktop.

## Dependencies

Never install prototype-specific packages into the root `package.json`. If this prototype needs a library that is not already a root dependency, add it to a `package.json` inside the prototype folder (`name`: `@<username>/<slug>`, `private`: true) and run `npm install` from the repo root.
