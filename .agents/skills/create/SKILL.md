---
name: create
description: Scaffold a new playground prototype under app/<username>/<slug>/ with meta.json and a minimal page.tsx, bootstrapping the contributor's local profile (.playground) on first run. Use when the user asks to create, scaffold, spin up, add, or make a new prototype.
---

# Create

Scaffolds a new playground prototype under `app/<username>/<slug>/` with `meta.json` and a minimal `page.tsx`.

## Workflow

Follow these steps in order. Stop and ask only when a step says to.

### 1. Resolve the contributor profile

Read `.playground` at the repo root.

- **If it exists**, parse it as env-style `KEY=VALUE` lines and extract `USERNAME`. Skip to step 2.
- **If it is missing**, bootstrap it:
  1. Run `git config user.name` to read the git author name.
  2. Derive a default `USERNAME`: the first whitespace-separated token of that git name, lowercased, with non-alphanumerics replaced by hyphens, hyphens collapsed, and leading/trailing hyphens trimmed.
  3. Ask the user to confirm or override `USERNAME` (one prompt). If `git config user.name` returned nothing, ask without a default.
  4. Write `.playground` using the [template below](#playground-template).
  5. Ensure `.gitignore` contains a line `.playground`. If `.gitignore` does not exist, create it. If the line is missing, append it. Do not duplicate.

### 2. Resolve the prototype inputs

The only required input is `title`.

- **`title`**:
  - If the user gave an explicit name (e.g. "create a prototype called 'Interactive Tooltip'"), use it verbatim.
  - Otherwise, **derive** a concise title from the request context. Aim for 2–4 descriptive words in Title Case. Examples:
    - "settings dialog in the app" → `App Settings Dialog`
    - "explore a new chat input design" → `Chat Input Exploration`
    - "image ticker for the website hero" → `Image Carousel Website Hero`
  - Only ask the user when the request gives you nothing to derive from.
- **`description`**: take from the prompt if the user provided one (or anything that clearly reads as a one-line summary). If they didn't, **omit the field** from `meta.json` — it's optional in `lib/registry.ts`.
- **`slug`**: derive from `title` via kebab-case (lowercase, non-alphanumerics → hyphens, collapse runs, trim leading/trailing hyphens).
- **`created`**: today's date in `YYYY-MM-DD`. Use the system date; do not ask.
- **`username`**: from `.playground` (`USERNAME`), unless the user explicitly named a different contributor in the prompt.

### 3. Check for collisions

If `app/<username>/<slug>/` already exists, **refuse**. Surface the conflict and ask the user for an alternative slug. Do not auto-suffix (`-2`, `-3`, …) and do not overwrite.

### 4. Write the files

Create exactly two files. Do not create an `assets/` folder; create one only on demand later, when the prototype actually needs media. Prototype-only media (images, video, fonts) must live inside `app/<username>/<slug>/assets/` and be loaded via static `import` — never under repo-root `public/`.

**`app/<username>/<slug>/meta.json`**

```json
{
  "title": "<title>",
  "description": "<description>",
  "created": "<YYYY-MM-DD>"
}
```

Omit `description` entirely if not provided.

**`app/<username>/<slug>/page.tsx`**

```tsx
export default function <PascalCaseTitle>() {
  return <div className="p-8">{/* your prototype here */}</div>;
}
```

`<PascalCaseTitle>` is the title with non-alphanumerics stripped and each word capitalized. If the result is empty or starts with a digit (e.g. `"100 Day Challenge"` → `"100DayChallenge"`), fall back to `Prototype`.

### 5. Confirm and continue

Announce the result with the dev URL:

> Created `app/<username>/<slug>/`. Open at `/<username>/<slug>`.

Then:

- If the user's original prompt described what to build inside the prototype, **continue immediately** by editing the new `page.tsx` to implement it.
- If the user only asked to scaffold, stop and wait.

The file is a tiny env-style document (one `KEY=VALUE` per line). It is gitignored. Edit freely or delete to re-bootstrap.

## Notes

- The slug determines the public URL at `/<username>/<slug>`; keep derivation deterministic.
- The function name is cosmetic but must be a valid TypeScript identifier so `page.tsx` compiles.
- Never edit another contributor's namespace under `app/<other-username>/` unless the user explicitly asks for that contributor.
- Never add prototype-specific dependencies to the root `package.json`. If a prototype needs a library that is not already a root dependency, add a `package.json` inside that prototype folder (`name`: `@<username>/<slug>`, `private`: true) and run `npm install` from the repo root.
