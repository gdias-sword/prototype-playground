---
name: Ship
description: Squash-merge a prototype into main so it's live on the production domain. Each ship is a short-lived branch that's created fresh from main, gated on a Vercel preview build, then auto-merged and deleted. Use when the user asks to ship, share, deploy, push, publish, get a link for, or update a prototype.
---

# Ship

Squash-merges a prototype into `main` and returns the production URL. Branch `<username>/<slug>` is created fresh from `main` on every ship, auto-merged once the Vercel preview is green, then deleted. `main` stays clean; the production domain reflects the latest state immediately.

## Required ambient setup

- `git remote get-url origin` must succeed.
- Vercel ↔ GitHub integration must be connected and a production deployment for `main` must exist.

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

- Stage only files inside `app/<username>/<slug>/` with explicit `git add <path>` calls. Never `git add .`.
- If there are dirty files outside the prototype directory, **refuse and stop**. Surface them clearly:

  > Cannot ship: these files outside `app/<username>/<slug>/` are dirty and must be handled separately before shipping:
  > `<list>`
  > Do not proceed until the working tree outside the prototype dir is clean (either committed, stashed, or reverted by the user).

- If there's nothing to stage (the prototype dir is clean), skip the commit and proceed to step 5. Track this — step 9 needs to know.

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

### 5. Branch from main

Every ship starts from a fresh branch off `main`. Never carry over a stale local branch.

```bash
git switch main
git pull
git branch -D <username>/<slug> 2>/dev/null || true
git switch -c <username>/<slug>
git push -u origin HEAD
```

Never force-push.

### 6. Open a PR

Create a PR for each ship. There is no long-lived PR — they're always fresh.

```bash
gh pr create \
  --title "🧪 <title>" \
  --body "<description or empty>" \
  --base main
```

- Title: `🧪 <title>` (use `title` from `meta.json` verbatim).
- Body: `description` from `meta.json` verbatim. If `description` is missing, omit `--body`.
- Base branch: `main`.

Capture the PR number and URL.

### 7. Wait for Vercel preview

Wait for Vercel's deployment status to settle:

```bash
gh pr checks <pr-number> --watch --interval 10
```

Cap the wait at 180 seconds. While waiting, print:

```
→ Waiting for Vercel preview... (typically ~60s)
```

- **All checks green** → continue to step 8.
- **Any check red** → fetch the failed run's log via `gh run view <run-id> --log-failed`, identify the issue (almost always inside `app/<username>/<slug>/`), fix it, re-stage, re-commit, re-push, and repeat from this step. **Cap at 3 post-push attempts.**
- **Cap exhausted** → close the PR (`gh pr close <pr-number>`), delete the remote branch (`git push origin --delete <username>/<slug>`), clean up locally (`git switch main && git branch -D <username>/<slug>`), output:

  > Build keeps failing after 3 attempts. The branch has been cleaned up. Fix the issue and run /ship again.

  Stop.

- **Timeout (180s, no resolution)** → output `Vercel hasn't reported back yet. Run /ship again once the preview settles.` and stop.

### 8. Auto-merge

Squash-merge the PR and delete the remote branch:

```bash
gh pr merge <pr-number> --squash --auto --delete-branch
```

Wait for the merge to complete by polling `gh pr view <pr-number> --json state` until `state` is `MERGED` (poll every 5s, cap at 60s).

### 9. Wait for production deploy

After merge, Vercel builds `main`. Wait for the production deployment to settle:

```bash
# Poll until a deployment matching the post-merge SHA appears and is READY
# Use the GitHub deployments API:
gh api "repos/{owner}/{repo}/deployments?environment=Production&per_page=5" \
  --jq '.[0] | {id: .id, sha: .sha}'
```

Poll `gh api "repos/{owner}/{repo}/deployments/<id>/statuses" --jq '.[0].state'` every 10s until state is `success`. Cap at 180s.

While waiting, print:

```
→ Deploying to production... (typically ~90s)
```

- **`success`** → continue to step 10.
- **`failure` or `error`** → output:

  > Production deploy failed. Check the Vercel dashboard and run /ship again once it's resolved.

  Stop.

- **Timeout** → output `Production deploy is still running. The prototype should be live shortly at <share-link>.` and stop (share the link anyway).

### 10. Resolve the share link

Use the production URL from the deployment record:

```bash
gh api "repos/{owner}/{repo}/deployments?environment=Production&per_page=1" \
  --jq '.[0].payload.web_url // empty'
```

If `web_url` is absent from the payload, fall back to extracting the URL from the latest deployment status:

```bash
gh api "repos/{owner}/{repo}/deployments/<id>/statuses" \
  --jq '.[0].target_url // empty'
```

Compose the final share link:

```
<prod-url>/<username>/<slug>
```

### 11. Local cleanup

```bash
git switch main
git pull
git branch -D <username>/<slug> 2>/dev/null || true
```

### 12. Hand back the link

Single output for every ship, regardless of whether it was the first or a re-ship:

```
🚀 Shipped <title>.

Live: <share-link>
```

Stop.

## Notes

- Never run the Vercel CLI. The repo is wired via Vercel's GitHub integration.
- Stage files explicitly with `git add <path>`. Never `git add .`.
- Prototypes must not touch shared code (`design/`, `components/`, `config/`, `utils/`, root configs, other contributors' prototypes). If dirty files outside `app/<username>/<slug>/` exist, refuse — don't warn.
- Never merge `main`-targeted app improvements (gallery, design system, shared utils) via this skill. Those are separate PRs in a separate lane.
- When surfacing build or deploy errors, summarise in plain English. Never paste raw stack traces unless the user asks.
