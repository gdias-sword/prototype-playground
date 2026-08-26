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
3. Add a `meta.json` with title, description, and created

```
app/
└── goncalo/
    └── my-new-prototype/
        ├── page.tsx
        └── meta.json
```

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
