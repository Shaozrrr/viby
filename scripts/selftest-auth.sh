#!/usr/bin/env bash
# 本地自检：起临时 Node，用与 server.js 相同算法造 Cookie，请求 /api/me 须返回 200
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SECRET="selftest-github-client-secret-min-32chars"
ST_PORT="$((41840 + RANDOM % 200))"
export PORT="$ST_PORT"
export GITHUB_CLIENT_SECRET="$SECRET"
unset COOKIE_DOMAIN || true
unset SESSION_SECRET || true
unset PUBLIC_ORIGIN || true

node server.js &
PID=$!

cleanup() {
  kill "$PID" 2>/dev/null || true
}
trap cleanup EXIT

for _ in $(seq 1 100); do
  if curl -sf "http://127.0.0.1:${ST_PORT}/api/health" >/dev/null; then
    break
  fi
  sleep 0.05
done

TOKEN="$(GITHUB_CLIENT_SECRET="$SECRET" node <<'NODE'
const crypto = require("crypto");
const secret = process.env.GITHUB_CLIENT_SECRET;
const payload = {
  id: "github-123",
  email: "test@users.noreply.github.com",
  name: "Selftest",
  provider: "github",
  exp: Date.now() + 3600_000,
};
const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
const sig = crypto.createHmac("sha256", secret).update(body).digest("base64url");
process.stdout.write(`${body}.${sig}`);
NODE
)"

OUT="$(curl -sS -w "\n%{http_code}" -H "Cookie: viby_session=${TOKEN}" "http://127.0.0.1:${ST_PORT}/api/me")"
CODE="$(echo "$OUT" | tail -n 1)"
BODY="$(echo "$OUT" | sed '$d')"

if [[ "$CODE" != "200" ]]; then
  echo "FAIL /api/me 期望 200，实际 HTTP $CODE"
  echo "$BODY"
  exit 1
fi

if ! echo "$BODY" | grep -q '"user"'; then
  echo "FAIL 响应中无 user"
  echo "$BODY"
  exit 1
fi

OUT2="$(curl -sS -w "\n%{http_code}" -H "X-Viby-Session: ${TOKEN}" "http://127.0.0.1:${ST_PORT}/api/me")"
CODE2="$(echo "$OUT2" | tail -n 1)"
if [[ "$CODE2" != "200" ]]; then
  echo "FAIL /api/me（仅 X-Viby-Session）期望 200，实际 HTTP $CODE2"
  exit 1
fi

echo "OK 本地会话验签 + /api/me 通过 (port=${ST_PORT})"
