#!/usr/bin/env bash
# 在 Ubuntu 生产机上以 root 或具备写权限的用户执行，一键覆盖 server.js / script.js 并重启 PM2。
# 用法：
#   sudo bash scripts/fix-production-oauth.sh /var/www/viby
# 若在项目根目录外克隆了本仓库，第二个参数可指定 bundle 目录：
#   sudo bash /path/to/viby-repo/scripts/fix-production-oauth.sh /var/www/viby /path/to/viby-repo/scripts/bundles

set -euo pipefail

VIBY_ROOT="${1:-/var/www/viby}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUNDLE_DIR="${2:-$SCRIPT_DIR/bundles}"

die() {
  echo "ERROR: $*" >&2
  exit 1
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "缺少命令: $1"
}

need_cmd python3
need_cmd node

[[ -d "$VIBY_ROOT" ]] || die "目录不存在: $VIBY_ROOT"
[[ -f "$BUNDLE_DIR/server.js.gz.b64" ]] || die "找不到 $BUNDLE_DIR/server.js.gz.b64（请完整克隆仓库或 scp 整个 scripts/bundles 目录）"
[[ -f "$BUNDLE_DIR/script.js.gz.b64" ]] || die "找不到 $BUNDLE_DIR/script.js.gz.b64"

cd "$VIBY_ROOT"

ts="$(date +%Y%m%d%H%M%S)"
for f in server.js script.js; do
  if [[ -f "$f" ]]; then
    cp -a "$f" "$f.bak.$ts"
  fi
done

python3 <<PY
import base64, gzip, pathlib

root = pathlib.Path(r"$VIBY_ROOT")
bdir = pathlib.Path(r"$BUNDLE_DIR")

for name in ("server.js", "script.js"):
    b64 = (bdir / f"{name}.gz.b64").read_text().strip()
    raw = gzip.decompress(base64.standard_b64decode(b64))
    (root / name).write_bytes(raw)
    print(f"OK wrote {name} ({len(raw)} bytes)")
PY

node --check server.js
node --check script.js

if command -v pm2 >/dev/null 2>&1; then
  if pm2 describe viby >/dev/null 2>&1; then
    pm2 restart viby
  else
    [[ -f ecosystem.config.cjs ]] || die "未找到 ecosystem.config.cjs，且 PM2 中无 viby 进程。请在 $VIBY_ROOT 执行: pm2 start ecosystem.config.cjs"
    pm2 start ecosystem.config.cjs
  fi
else
  die "未安装 pm2，无法重启。请安装后执行: npm i -g pm2"
fi

port="4184"
if [[ -f .env ]]; then
  line="$(grep -E '^[[:space:]]*PORT=' .env | tail -n1 || true)"
  if [[ -n "$line" ]]; then
    port="${line#*=}"
    port="${port//\"/}"
    port="${port//\'/}"
    port="${port// /}"
  fi
fi

sleep 1
out="$(curl -sS -m 5 "http://127.0.0.1:$port/api/health" || true)"
if [[ "$out" == *'"ok":true'* ]] || [[ "$out" == *"'ok':true"* ]]; then
  echo "OK /api/health: $out"
else
  echo "WARN: 本机 http://127.0.0.1:$port/api/health 未返回预期 JSON，请检查 .env PORT 是否与 PM2 一致、或 Nginx 反代端口。"
  echo "响应片段: ${out:0:200}"
fi

echo "--- 请确认 server.js 已含 oauthFailRedirect（应有两行以上匹配）---"
grep -n oauthFailRedirect server.js | head -5 || die "server.js 仍无 oauthFailRedirect"

echo "完成。浏览器请强制刷新（Cmd+Shift+R），再试 GitHub 登录。若仍有兜底提示，请看地址栏是否带 github_err= 并检查 Nginx 是否把 /api/ 反代到本机该端口。"
