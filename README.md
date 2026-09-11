# Sword Playground

A shared prototype playground for design & product experimentation, powered by Sword.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to browse all prototypes.

## Creating a prototype

1. Create a folder at `app/[your-name]/[prototype-name]/`
2. Add a `page.tsx` with a default-exported React component
3. Add a `profile.json` for the author with their team
4. Add a `meta.json` with title, description, and created

```
app/
└── goncalo/
    ├── profile.json
    └── my-new-prototype/
        ├── page.tsx
        └── meta.json
```

### `profile.json`

```json
{
  "name": "Your Name",
  "team": "Product Design"
}
```

Author teams are `Product Design`, `Product Management`, or `Engineering`. The team applies to every prototype by that author.

### `meta.json`

```json
{
  "title": "Your New Prototype",
  "description": "What you're exploring",
  "created": "2026-04-23"
}
```

### `page.tsx`

```tsx
export default function MyNewPrototype() {
  return <div className="p-8">{/* your prototype here */}</div>;
}
```

Your prototype will appear in the gallery automatically at `localhost:3000/[your-name]/[prototype-name]`. No registration needed.

Folders without a `meta.json` are ignored by the gallery — useful for WIP work you're not ready to surface yet.

### Dependencies

The root `package.json` is for shared core packages used across the playground (Next.js, React, the design system, and other reusable libraries). Do not add a dependency there because one prototype needs it.

If a prototype needs its own library, add a `package.json` inside that prototype folder:

```
app/goncalo/my-new-prototype/
├── package.json
├── page.tsx
└── meta.json
```

```json
{
  "name": "@goncalo/my-new-prototype",
  "private": true,
  "dependencies": {
    "some-library": "^1.0.0"
  }
}
```

Then run `npm install` from the repo root. Prototype folders are npm workspaces (`app/*/*`), so those dependencies install with the rest of the project.

## Design system

The Sword design system lives in `design/` at the root of the repo:

```
design/
├── components/   # React components (Button, …)
├── tokens/       # Colors, typography, breakpoints as CSS variables
├── icons/        # Icon components
├── brand/        # Sword logos and brand assets
└── lib/          # cn() and other DS utilities
```

Tokens are exposed as Tailwind utilities (e.g. `bg-background-brand-default`, `text-body-medium-strong`). To use a component:

```tsx
import { Button } from '@/phoenix/components/button';

<Button variant="solid">Click me</Button>;
```

## Formatting

```bash
npm run format
```
