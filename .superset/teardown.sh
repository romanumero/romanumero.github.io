#!/usr/bin/env bash
# Stop anything run.sh started in this workspace.
set -uo pipefail
cd "${SUPERSET_WORKSPACE_PATH:-$(git rev-parse --show-toplevel)}" || exit 0

if [ -f .superset/.run.pid ]; then
  pid=$(cat .superset/.run.pid)
  pkill -P "$pid" 2>/dev/null; kill "$pid" 2>/dev/null
  echo "✓ stopped dev server (pid $pid)"
fi
# Catch any stray astro dev started from this workspace
pkill -f "$PWD/node_modules/.bin/astro dev" 2>/dev/null || true
rm -f .superset/.port .superset/.run.pid
