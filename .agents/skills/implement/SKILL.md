---
name: implement
description: Implement UI in a playground prototype using the Sword design system. Use when building, exploring, or iterating on a prototype screen or flow.
disable-model-invocation: true
---

# Implement

Implement UI in a playground prototype using the Sword design system.

## Tokens

Before writing any code, read `design/globals.css`. It is the source of truth for available design system tokens.

## Components

Reach for a component from `@/design/components/` before building a custom one — if it covers the intent, use it. Check `button.tsx` for a reference implementation of correct token usage.

## Breakpoints

Every prototype must be responsive across breakpoints. Use the breakpoint values defined in `design/globals.css` to set responsive variants throughout the styling work.

If the reference design only covers one breakpoint, infer the others using standard responsive design heuristics.

## Dependencies

Never install prototype-specific packages into the root `package.json`. If this prototype needs a library that is not already a root dependency, add it to a `package.json` inside the prototype folder (`name`: `@<username>/<slug>`, `private`: true) and run `npm install` from the repo root.
