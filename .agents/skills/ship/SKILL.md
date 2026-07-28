---
name: Ship Prototype
description: Push a prototype to its long-lived branch, watch the Vercel preview, and hand back a stable share link. Each prototype lives on one branch with one open PR — the iteration thread — so the link stays the same every time you ship. Use when the user asks to ship, share, deploy, push, publish, get a link for, or update a prototype.
---

# Ship Prototype

Pushes a prototype to its branch and returns a stable share link. The PR is a long-lived iteration thread: never merge it, never delete the branch.

## Required ambient setup

- `git remote get-url origin` must succeed.
- Vercel ↔ GitHub integration must be connected via the Vercel dashboard.

If either is missing, refuse with a one-line message naming the missing piece and stop.

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

Announce the resolved target before continuing: `Shipping <username>/<slug>...`.

### 3. Validate `meta.json`

Read `app/<username>/<slug>/meta.json`.

- Must parse as JSON.
- Must contain `title` (string) and `createdAt` (`YYYY-MM-DD`).
- `description` is optional.

If invalid, fix it before continuing. Fixes here don't count toward the post-push attempt cap in step 7.

### 4. Stage scoped commit

Run `git status --porcelain`.

- Stage only files inside `app/<username>/<slug>/` with explicit `git add <path>` calls. Never `git add .`. Never stage shared files (`design/`, `lib/`, root configs, other contributors' prototypes).
- If there are dirty files outside the prototype, surface them: `Note: leaving these files unstaged: <list>`. Do not block.
- If there's nothing to stage, skip the commit and proceed to step 5. Track this — step 9 needs to know.

Pick the commit emoji from the diff:

| Emoji | When                              |
| ----- | --------------------------------- |
| ✨    | New feature or iteration          |
| 🎨    | Visual / styling improvement      |
| 🐛    | Fixing a bug                      |
| ♻️    | Refactor without behaviour change |
| 🔧    | Config / metadata only            |

Subject line: imperative mood, ≤72 chars, names the prototype path. Example:

```
🎨 Tighten spacing on <username>/<slug>
```

Commit using HEREDOC:

```bash
git commit -m "$(cat <<'EOF'
<emoji> <subject>
EOF
)"
```

### 5. Branch + push

Branch name: `<username>/<slug>`. One branch per prototype.

- If already on that branch, push: `git push -u origin HEAD`.
- If on `main` or any other branch, switch with `git switch -c <username>/<slug>` (or `git switch <username>/<slug>` if it exists locally) and push.
- Never force-push. Never amend. Never delete the branch.

### 6. Open or update the PR

Check for an existing open PR for this branch:

```bash
gh pr view <username>/<slug> --json number,url,state 2>/dev/null
```

- **No PR yet** → create one with `gh pr create`:
  - Title: `🧪 <title>` (use `title` from `meta.json` verbatim).
  - Body: `description` from `meta.json` verbatim. If `description` is missing, omit `--body`.
  - Base branch: `main`.
  - Track that this run created the PR — step 9 needs to know.

- **PR already exists** → no action; the push in step 5 already updated it. Capture the PR number and URL for later steps.

### 7. Watch Vercel preview

Wait for Vercel's deployment status to settle:

```bash
gh pr checks <pr-number> --watch --interval 10
```

Cap the wait at 180 seconds. While waiting, print:

```
→ Waiting for Vercel preview... (typically ~60s)
```

- **All checks green** → continue to step 8.
- **Any check red** → fetch the failed run's log via `gh run view <run-id> --log-failed`, identify the issue (almost always inside `app/<username>/<slug>/`), fix it, repeat from step 4. **Cap at 3 post-push attempts.**
- **Cap exhausted** → leave the PR open. Output:

  > Vercel build keeps failing after 3 attempts. PR is open at `<url>` with full logs. Take a look manually.

  Stop.

- **Timeout (180s, no resolution)** → output `Vercel hasn't reported back yet. PR: <url>. Check the deployment tab when you have a moment.` and stop.

### 8. Resolve the share link

Fetch the latest Vercel bot comment on the PR and extract the branch-alias preview URL:

```bash
gh pr view <pr-number> --json comments \
  --jq '[.comments[] | select(.author.login == "vercel" or .author.login == "vercel[bot]")] | last | .body'
```

The comment contains a Markdown table with a "Visit Preview" link. Extract the URL matching `https://<project>-git-<sanitized-branch>-<scope>.vercel.app` — the branch alias, stable across pushes.

Compose the final share link:

```
<branch-alias>/<username>/<slug>
```

If comment parsing fails (e.g. the bot hasn't posted yet despite checks being green), fall back to extracting a deployment URL from `gh pr view <pr-number> --json statusCheckRollup` and warn the user once that this link may rotate.

### 9. Hand back the link

Use the template that matches the situation, verbatim.

**First ship** (PR was created in this run):

```
🎉 <title> is live!

Live: <share-link>
Feedback: <pr-url>

Keep editing and run /ship again to update.
```

**Re-ship with new commits:**

```
🚀 Shipped <title>.

Live: <share-link>
Feedback: <pr-url>
```

**Re-ship with no new commits** (step 4 created no commit):

```
Nothing new to ship.

Live: <share-link>
Feedback: <pr-url>
```

Stop.

## Notes

- Never run the Vercel CLI. The repo is wired via Vercel's GitHub integration.
- Stage files explicitly with `git add <path>`. Never `git add .`.
- Never merge the PR. Never delete the branch.
- Engineering handoff is out of scope.
- When surfacing build or deploy errors, summarise in plain English. Never paste raw stack traces unless the user asks.
