---
name: share
description: Commit and push a prototype iteration directly to main, wait for Vercel deployment, and return a shareable deployment URL. Use when the user asks to share, deploy, push, publish or update a prototype.
disable-model-invocation: true
---

# Share

Commit a prototype iteration directly to `main`, push it, wait for the Vercel production deployment, and returns a shareable URL. `main` is the playground active development and deployment stream: every meaningful iteration should be committed so it can be revisited, shared, and discussed.

## Setup

- By default, the current branch is `main`. If the user explicitly requests a branch-based workflow, use the branch specified instead.
- `git remote get-url origin` must succeed.
- `gh auth status` must succeed so deployment status and URL can be resolved.
- Vercel ↔ GitHub integration must be connected and a deployment for the target branch must exist.

If any is missing, refuse with a one-line message naming the missing setup and stop.

## Workflow

Follow these steps in order. Stop only where a step says to.

### 1. Verify the deployment stream

Run `gh auth status`. If it fails, run `gh auth login` and let `gh` drive the browser flow before continuing.

Run:

```bash
git branch --show-current
git remote get-url origin
```

If the current branch is not `main` and the user did not explicitly request a branch-based workflow, stop and ask the user to switch to `main`. Do not create, switch to, or delete a prototype branch unless the user explicitly requests it.

### 2. Resolve the target prototype

Pick exactly one prototype (`<username>/<slug>`) using this priority order:

1. **Explicit mention.** If the user named one in the prompt, use that. If the named prototype directory doesn't exist, refuse and ask.
2. **Single dirty prototype.** Run `git status --porcelain`. If dirty/untracked files all belong to a single prototype directory under `app/`, use that.
3. **Most recently modified.** Within the contributor namespace from `.playground` (`USERNAME`), pick the prototype directory with the latest work.
4. **Ask.** If still ambiguous, list candidates and ask.

Never select a prototype under `app/<other-username>/` unless the user explicitly named it.

Announce the resolved target before continuing: `Sharing <username>/<slug>...`.

### 3. Validate `meta.json`

Read `app/<username>/<slug>/meta.json`.

- Must parse as JSON.
- Must contain `title` (string) and `created` (`YYYY-MM-DD`).
- `description` is optional.

If invalid, fix it before continuing.

### 4. Stage scoped commit

Run `git status --porcelain`.

- Stage only files inside `app/<username>/<slug>/` with explicit `git add <path>` calls. Never `git add .`.
- If there are dirty files outside the prototype directory, **refuse and stop**.
- If there's nothing to stage (the prototype directory is clean), skip the commit and proceed to step 5. Track this so step 7 can resolve the current deployment.

### 5. Commit and push the iteration

`main` is intentionally the active playground branch by default. Commit every meaningful iteration so it has a durable version in Git history, then push that commit to trigger a Vercel deployment.

```bash
git push origin HEAD
```

Never force-push. If the prototype directory is clean, skip the commit and push, and resolve the latest deployment for the current `main` SHA instead.

### 6. Wait for the Vercel deployment

Wait for the deployment matching the pushed commit SHA to settle. For the default `main` workflow this is a production deployment; for an explicitly requested branch, use that branch Vercel preview deployment. Use the GitHub deployment API:

```bash
gh api "repos/{owner}/{repo}/deployments?environment=<target-environment>&sha=<commit-sha>&per_page=5"
```

Poll the matching deployment's statuses every 10 seconds until its state is `success`, `failure`, or `error`. Cap the wait at 180 seconds. While waiting, print:

```
→ Waiting for Vercel deployment... (typically ~60s)
```

- **`success`** → continue to step 7.
- **`failure` or `error`** → identify the issue, fix it inside the prototype scope, create a new commit, push again, and repeat from this step. **Cap at 3 post-push attempts.**
- **Cap exhausted** → output:
  > Build keeps failing after 3 attempts. Fix the issue and run /share again.
  > Stop.
- **Timeout (180s, no resolution)** → output `Vercel hasn't reported back yet. Run /share again once the deployment settles.` and stop.

### 7. Resolve the share link

Use the deployment-specific URL from the successful deployment record:

```bash
gh api "repos/{owner}/{repo}/deployments/<deployment-id>/statuses" \
  --jq '.[0].target_url // empty'
```

If the deployment status has no URL, read the deployment payload:

```bash
gh api "repos/{owner}/{repo}/deployments/<deployment-id>" \
  --jq '.payload.web_url // empty'
```

Compose the final share link:

```
<prod-url>/<username>/<slug>
```

### 8. Hand back the link

Single output for every iteration, regardless of whether it was the first deployment or a re-deployment:

```
🚀 Shared <title>.

Live: <share-link>
```

Stop.

## Notes

- Use the GitHub integration by default. Use the Vercel CLI only when explicitly requested or when the GitHub integration cannot perform the required deployment or diagnosis.
- Stage files explicitly with `git add <path>`. Never `git add .`.
- Prototypes must not touch shared code (`design/`, `components/`, `config/`, `utils/`) or other contributors prototypes. If dirty files outside `app/<username>/<slug>/` exist, refuse — don't warn.
- The default prototype workflow uses `main` directly; branches and pull requests are optional and valid when the user explicitly requests them for parallel or isolated work.
- When surfacing build or deploy errors, summarise in plain English. Never paste raw stack traces unless the user asks.
