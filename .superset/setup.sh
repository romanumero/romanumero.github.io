#!/usr/bin/env bash
# Prepare a fresh Superset workspace: node deps + untracked local files.
set -euo pipefail
cd "${SUPERSET_WORKSPACE_PATH:-$(git rev-parse --show-toplevel)}"

# 1. Node deps (Astro site)
if [ -f package-lock.json ]; then npm ci --no-audit --no-fund --loglevel=error; else npm install --no-audit --no-fund --loglevel=error; fi
echo "✓ node_modules installed (astro $(node -p "require('astro/package.json').version"))"

# 2. Private drafts repo (read by `npm run dev`); shared by all workspaces, cloned once
DRAFTS_DIR="${DRAFTS_DIR:-$HOME/Labs/damonhenry-drafts}"
if [ ! -d "$DRAFTS_DIR/.git" ]; then
  git clone -q git@github.com:romanumero/damonhenry-drafts.git "$DRAFTS_DIR" \
    && echo "✓ cloned drafts repo to $DRAFTS_DIR" \
    || echo "! could not clone drafts repo; drafts won't show in dev"
else
  git -C "$DRAFTS_DIR" pull -q --ff-only 2>/dev/null && echo "✓ drafts repo up to date ($DRAFTS_DIR)" || true
fi

# 3. Copy untracked env/config files from the main checkout (never overwrite)
if [ -n "${SUPERSET_ROOT_PATH:-}" ] && [ "$SUPERSET_ROOT_PATH" != "$PWD" ]; then
  for f in .env .env.local .envrc .superset/config.local.json; do
    if [ -f "$SUPERSET_ROOT_PATH/$f" ] && [ ! -e "$f" ]; then
      cp "$SUPERSET_ROOT_PATH/$f" "$f" && echo "✓ copied $f from main checkout"
    fi
  done
fi
