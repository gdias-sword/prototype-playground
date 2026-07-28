---
name: Deploy Prototype
description: Take a contributor's prototype from working tree to a live, durable URL. Commits scoped changes, pushes a per-prototype branch, opens (or updates) a PR, watches the Vercel preview, auto-merges to main with rebase once green, and hands back the production URL. Use when the user asks to deploy, ship, share, publish, push to vercel, get a link for, or make live a prototype.
---

# Deploy Prototype

Takes a prototype from working tree to a shareable URL. Handles the commit, branch, push, PR, Vercel watch, and merge end-to-end.

## Required ambient setup

- `git remote get-url origin` must succeed.
- Vercel ↔ GitHub integration must be connected via the Vercel dashboard.
- `playground.config.json` at repo root is optional — the skill discovers and writes `productionUrl` on first run if missing.

If the git remote or Vercel link is missing, refuse with a one-line message naming the missing piece and stop.

## Workflow

Follow these steps in order. Stop only where a step says to.

### 1. Resolve per-machine auth

Run `gh auth status`. If it fails, run `gh auth login` and let `gh` drive the browser flow before continuing.

### 2. Resolve the target prototype

Pick exactly one prototype (`<username>/<slug>`) using this priority order:

1. **Explicit mention.** If the user named one in the prompt, use that. If the named prototype's directory doesn't exist, refuse and ask.
2. **Single dirty prototype.** Run `git status --porcelain`. If dirty/untracked files all belong to a single prototype directory under `app/`, use that.
3. **Most-recently-modified.** Within the contributor's namespace from `.playground` (`USERNAME`), pick the prototype directory with the latest mtime.
4. **Ask.** If still ambiguous, list candidates and ask.

Never select a prototype under `app/<other-username>/` unless the user explicitly named it.

Announce the resolved target before continuing: `Deploying goncalo/image-ticker-quiz-hero...`.

### 3. Validate `meta.json`

Read `app/<username>/<slug>/meta.json`.

- Must parse as JSON.
- Must contain `title` (string) and `createdAt` (`YYYY-MM-DD`).
- `description` is optional.

If invalid, fix it. Counts toward the 3-attempt cap in step 4.

### 4. Local `next build`

Run `npm run build` from the repo root.

- **Passes** → continue to step 5.
- **Fails** → read stderr, identify the offending file (almost always inside `app/<username>/<slug>/`), fix it, re-run. **Cap at 3 attempts** total (counting any `meta.json` fix from step 3).
- **Cap exhausted** → stop. Do not push. Do not revert agent edits. Output:

  > Couldn't make the build green after 3 attempts. Files I touched: `<list>`. Last error: `<one-line plain-English summary>`. Take a look and re-run when ready.

### 5. Stage scoped commit

Run `git status --porcelain` again.

- Stage only files inside `app/<username>/<slug>/` with explicit `git add <path>` calls. Never `git add .`. Never stage shared files (`design/`, `lib/`, root configs, other contributors' prototypes).
- If there are dirty files outside the prototype, surface them: `Note: leaving these files unstaged: <list>`. Do not block.
- If there's nothing to stage (re-deploy with no new changes), skip the commit and proceed to step 6.

Pick the commit emoji from the diff:

| Emoji | When                                                       |
| ----- | ---------------------------------------------------------- |
| ✨    | First deploy of this prototype, or substantive new content |
| 🎨    | Visual / styling iteration                                 |
| 🐛    | Fixing a bug                                               |
| ♻️    | Refactor without behaviour change                          |
| 🔧    | Config / metadata only                                     |

Subject line: imperative mood, ≤72 chars, names the prototype path. Example:

```
✨ Add image ticker carousel to goncalo/image-ticker-quiz-hero
```

Commit using HEREDOC:

```bash
git commit -m "$(cat <<'EOF'
<emoji> <subject>
EOF
)"
```

### 6. Branch + push

Branch name: `<username>/<slug>` (e.g. `goncalo/image-ticker-quiz-hero`).

- If already on that branch, push: `git push -u origin HEAD`.
- If on `main` or any other branch, switch with `git switch -c <username>/<slug>` (or `git switch <username>/<slug>` if it exists locally) and push.
- Never force-push. Never amend.

### 7. Open or update the PR

Check for an existing open PR for this branch:

```bash
gh pr view <username>/<slug> --json number,url,state 2>/dev/null
```

- **No PR yet** → create one with `gh pr create`:
  - Title: `🚀 Deploy <prototype-title>` (use `title` from `meta.json` verbatim).
  - Body (HEREDOC):

    ```
    Deploying [`<username>/<slug>`](app/<username>/<slug>/).

    <description from meta.json, or omit this line if missing>
    ```

  - Base branch: `main`.

- **PR already exists** (re-deploy) → no action; the push in step 6 already updated it.

### 8. Watch Vercel preview

Wait for Vercel's deployment status to settle:

```bash
gh pr checks <pr-number> --watch --interval 10
```

Cap the wait at 180 seconds. Print phased progress so the user knows it isn't stuck:

```
→ Waiting for Vercel preview... (typically ~60s)
```

- **All checks green** → continue to step 9.
- **Any check red** → fetch the failed run's log via `gh run view <run-id> --log-failed`, identify the issue, fix the prototype, repeat from step 5. Cap at 3 attempts for the post-push loop, separate from the local-build cap.
- **Post-push cap exhausted** → leave the PR open, do not merge. Output:

  > Vercel build keeps failing despite local build passing. PR is open at `<url>` with full logs. Take a look manually.

- **Timeout (180s, no resolution)** → output `Vercel hasn't reported back yet. PR: <url>. Check the deployment tab when you have a moment.` and stop.

### 9. Resolve the production URL

Look for `playground.config.json` at the repo root.

- **Exists with `productionUrl`** → use it.
- **Missing or empty** → discover via:

  ```bash
  gh api repos/<owner>/<repo>/deployments?environment=Production --jq '.[0].url'
  ```

  Dereference to get `target_url`. Write the result to `playground.config.json` using the [template below](#playgroundconfigjson-template). Don't include the config file in the current PR — leave it staged for the user to commit separately. Tell the user: `Discovered production URL <url> and wrote it to playground.config.json — please commit it.`

### 10. Auto-merge with rebase

Once Vercel is green:

```bash
gh pr merge <pr-number> --rebase --delete-branch
```

### 11. Hand back the URL

Final output:

```
Deployed <username>/<slug>

Live: <productionUrl>/<username>/<slug>
PR:   <pr-url>
```

Stop.

## Templates

### `playground.config.json` template

```json
{
  "productionUrl": "https://playground-sword.vercel.app"
}
```

Committed to git. Non-secret. Omit any trailing slash; the skill adds it when joining with the prototype path.

## Notes

- Never run the Vercel CLI. The repo is wired via Vercel's GitHub integration.
- Stage files explicitly with `git add <path>`. Never `git add .`.
- When surfacing build or deploy errors, summarise in plain English. Never paste raw stack traces unless the user asks.
