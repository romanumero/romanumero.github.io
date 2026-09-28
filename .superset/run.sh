#!/usr/bin/env bash
# Launch the Astro dev server on the first free port >= 4321 so parallel
# workspaces never collide. Override with PORT=xxxx.
set -euo pipefail
cd "${SUPERSET_WORKSPACE_PATH:-$(git rev-parse --show-toplevel)}"

[ -x node_modules/.bin/astro ] || ./.superset/setup.sh

port_free() { ! nc -z 127.0.0.1 "$1" >/dev/null 2>&1; }
PORT="${PORT:-4321}"
while ! port_free "$PORT"; do PORT=$((PORT + 1)); done

echo "$PORT" > .superset/.port
echo $$ > .superset/.run.pid
trap 'rm -f .superset/.port .superset/.run.pid' EXIT
echo "▶ Serving ${SUPERSET_WORKSPACE_NAME:-site} at http://127.0.0.1:$PORT"
"$PWD/node_modules/.bin/astro" dev --host 127.0.0.1 --port "$PORT" --ignore-lock  # --ignore-lock keeps it in the foreground even when run by an agent
