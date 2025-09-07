#!/usr/bin/env bash
set -euo pipefail

# Sync local 'main' with 'upstream/main' and push to 'origin/main'.
# - Automatically stashes dirty changes and restores them afterward.
# - Fast-forward only to avoid accidental merge commits.
# - Verifies 'upstream' remote exists.

REMOTE_UPSTREAM=${REMOTE_UPSTREAM:-upstream}
REMOTE_ORIGIN=${REMOTE_ORIGIN:-origin}
BRANCH=${BRANCH:-main}

echo "➤ Verifying remotes..."
if ! git remote get-url "$REMOTE_UPSTREAM" >/dev/null 2>&1; then
  echo "✖ Remote '$REMOTE_UPSTREAM' not found."
  echo "  Add it with:"
  echo "    git remote add upstream https://github.com/<org_or_owner>/<repo>.git"
  exit 1
fi

echo "➤ Fetching from '$REMOTE_UPSTREAM'..."
git fetch "$REMOTE_UPSTREAM"

# Track whether we created a stash so we can restore only then
STASH_CREATED=0

# Auto-stash if there are local changes
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "➤ Stashing local changes..."
  git stash push -u -m "sync-upstream: auto-stash $(date +%Y-%m-%dT%H:%M:%S)"
  STASH_CREATED=1
fi

echo "➤ Switching to '$BRANCH'..."
git checkout "$BRANCH"

echo "➤ Fast-forward pulling from '$REMOTE_UPSTREAM/$BRANCH'..."
git pull --ff-only "$REMOTE_UPSTREAM" "$BRANCH"

echo "➤ Pushing to '$REMOTE_ORIGIN/$BRANCH'..."
git push "$REMOTE_ORIGIN" "$BRANCH"

# Restore stash if created
if [ "$STASH_CREATED" -eq 1 ]; then
  echo "➤ Restoring stashed changes..."
  # Use 'stash pop' to re-apply and drop the stash
  # If it conflicts, Git will tell you which files need attention.
  git stash pop || {
    echo "⚠️ Conflicts occurred when applying the stash. Resolve them and commit as needed."
    exit 0
  }
fi

echo "✅ Done. Local '$BRANCH' is synced with '$REMOTE_UPSTREAM/$BRANCH' and pushed to '$REMOTE_ORIGIN/$BRANCH'."