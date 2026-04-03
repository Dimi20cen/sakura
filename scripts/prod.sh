#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKIP_BUILD="${SKIP_BUILD:-0}"
STOP_DB_ON_EXIT="${STOP_DB_ON_EXIT:-0}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_cmd docker
require_cmd go
require_cmd npm

warn_if_docker_only_mongo_host() {
  local mongo_url=""
  if [[ -f "$ROOT_DIR/.env" ]]; then
    mongo_url="$(sed -n 's/^MONGO_URL=//p' "$ROOT_DIR/.env" | tail -n 1)"
  fi

  if [[ "$mongo_url" == *"@mongodb:27017"* ]] || [[ "$mongo_url" == mongodb://mongodb:* ]] || [[ "$mongo_url" == *"//mongodb:27017"* ]]; then
    cat >&2 <<'EOF'
[prod] Warning: root .env uses Mongo host "mongodb".
[prod] ./scripts/prod.sh starts the backend on the host machine, so it should usually use localhost instead:
[prod]   MONGO_URL=mongodb://<user>:<password>@localhost:27017/sakura?authSource=admin
[prod] The hostname "mongodb" only works inside the Docker Compose network used by deploy/docker-compose.yml.
EOF
  fi
}

cleanup() {
  local exit_code=$?
  trap - EXIT INT TERM

  if [[ -n "${UI_PID:-}" ]] && kill -0 "$UI_PID" 2>/dev/null; then
    kill -- "-$UI_PID" 2>/dev/null || true
  fi

  if [[ -n "${BACKEND_PID:-}" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill -- "-$BACKEND_PID" 2>/dev/null || true
  fi

  wait 2>/dev/null || true
  if [[ "$STOP_DB_ON_EXIT" == "1" ]]; then
    echo "[prod] Stopping MongoDB..."
    (cd "$ROOT_DIR" && docker compose down)
  fi
  exit "$exit_code"
}

trap cleanup EXIT INT TERM

cd "$ROOT_DIR"
echo "[prod] Starting MongoDB..."
docker compose up -d mongodb
warn_if_docker_only_mongo_host

if [[ "$SKIP_BUILD" != "1" ]]; then
  echo "[prod] Building Next.js UI..."
  (
    cd "$ROOT_DIR/ui"
    npm run build
  )
fi

rm -f "$ROOT_DIR/ui/.next/standalone/.env.local"
if [[ -f "$ROOT_DIR/ui/.env.local" ]]; then
  cp "$ROOT_DIR/ui/.env.local" "$ROOT_DIR/ui/.next/standalone/.env.local"
fi

rm -rf "$ROOT_DIR/ui/.next/standalone/public"
cp -aL "$ROOT_DIR/ui/public" "$ROOT_DIR/ui/.next/standalone/public"
rm -rf "$ROOT_DIR/ui/.next/standalone/.next/static"
cp -a "$ROOT_DIR/ui/.next/static" "$ROOT_DIR/ui/.next/standalone/.next/static"

echo "[prod] Starting backend on :8090..."
setsid bash -lc "cd \"$ROOT_DIR\" && exec go run cmd/server/main.go" &
BACKEND_PID=$!

echo "[prod] Starting Next.js production server on :3000..."
setsid bash -lc "cd \"$ROOT_DIR/ui\" && exec env NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000 node .next/standalone/server.js" &
UI_PID=$!

echo "[prod] Running. Press Ctrl+C to stop backend + UI."
echo "[prod] Set STOP_DB_ON_EXIT=1 to also stop MongoDB on exit."
wait -n "$BACKEND_PID" "$UI_PID"
