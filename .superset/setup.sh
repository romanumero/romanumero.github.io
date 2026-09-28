#!/usr/bin/env bash
# Prepare a fresh Superset workspace: node deps + untracked local files.
set -euo pipefail
cd "${SUPERSET_WORKSPACE_PATH:-$(git rev-parse --show-toplevel)}"

# 1. Node deps (Astro site)
if [ -f package-lock.json ]; then npm ci --no-audit --no-fund --loglevel=error; else npm install --no-audit --no-fund --loglevel=error; fi
echo "✓ node_modules installed (astro $(node -p "require('astro/package.json').version"))"

# 2. Copy untracked env/config files from the main checkout (never overwrite)
if [ -n "${SUPERSET_ROOT_PATH:-}" ] && [ "$SUPERSET_ROOT_PATH" != "$PWD" ]; then
  for f in .env .env.local .envrc .superset/config.local.json; do
    if [ -f "$SUPERSET_ROOT_PATH/$f" ] && [ ! -e "$f" ]; then
      cp "$SUPERSET_ROOT_PATH/$f" "$f" && echo "✓ copied $f from main checkout"
    fi
  done
fi
