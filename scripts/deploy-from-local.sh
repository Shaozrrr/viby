#!/usr/bin/env bash
# 在 Mac 本机项目根执行：把当前仓库里的静态与 Node 文件同步到 VPS，并 ssh 远程 pm2 restart。
# 先配置 .env.deploy（从 .env.deploy.example 复制），并确保本机能无交互 ssh 到服务器（ssh-copy-id）。
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ -f "$ROOT/.env.deploy" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env.deploy"
  set +a
fi

die() {
  echo "ERROR: $*" >&2
  exit 1
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "缺少命令: $1（macOS 可装: brew install rsync 一般已自带）"
}

need_cmd rsync
need_cmd ssh

SSH_TARGET="${VIBY_DEPLOY_SSH:-}"
[[ -n "$SSH_TARGET" ]] || die "请在本机创建 $ROOT/.env.deploy 并设置 VIBY_DEPLOY_SSH=用户@主机（可参考 .env.deploy.example）"

REMOTE_PATH="${VIBY_DEPLOY_PATH:-/var/www/viby}"
PM2_NAME="${VIBY_DEPLOY_PM2_NAME:-viby}"
RSYNC_RSH="${VIBY_DEPLOY_SSH_CMD:-ssh}"
REMOTE_ENV_FILE="${VIBY_DEPLOY_ENV_FILE:-}"

echo "==> rsync -> ${SSH_TARGET}:${REMOTE_PATH}/"

FILES=(
  server.js
  script.js
  index.html
  share.js
  share.html
  styles.css
  works.js
  works.html
  ecosystem.config.cjs
  package.json
  logo-source.png
)

FULL_PATHS=()
for f in "${FILES[@]}"; do
  [[ -f "$ROOT/$f" ]] || die "本地缺少文件: $f"
  FULL_PATHS+=("$ROOT/$f")
done

rsync -avz --checksum -e "$RSYNC_RSH" \
  "${FULL_PATHS[@]}" \
  "$SSH_TARGET:$REMOTE_PATH/"

if [[ -d "$ROOT/assets" ]]; then
  rsync -avz --checksum -e "$RSYNC_RSH" "$ROOT/assets/" "$SSH_TARGET:$REMOTE_PATH/assets/"
fi

if [[ -d "$ROOT/scripts" ]]; then
  rsync -avz --checksum -e "$RSYNC_RSH" "$ROOT/scripts/" "$SSH_TARGET:$REMOTE_PATH/scripts/"
fi

if [[ -n "$REMOTE_ENV_FILE" ]]; then
  [[ -f "$ROOT/$REMOTE_ENV_FILE" ]] || die "指定的环境文件不存在: $REMOTE_ENV_FILE"
  echo "==> rsync .env -> ${SSH_TARGET}:${REMOTE_PATH}/.env"
  rsync -avz --checksum -e "$RSYNC_RSH" "$ROOT/$REMOTE_ENV_FILE" "$SSH_TARGET:$REMOTE_PATH/.env"
fi

echo "==> ssh: pm2 restart ${PM2_NAME} + node --check"
$RSYNC_RSH "$SSH_TARGET" bash -s <<REMOTE
set -euo pipefail
cd "${REMOTE_PATH}"
node --check server.js
node --check script.js
node --check share.js
if command -v pm2 >/dev/null 2>&1; then
  pm2 restart "${PM2_NAME}" || pm2 start ecosystem.config.cjs
else
  echo "WARN: 服务器未找到 pm2，请自行重启 Node 进程。"
fi
REMOTE

PUB="${VIBY_PUBLIC_URL:-}"
if [[ -n "$PUB" ]]; then
  echo "==> 公网自检: ${PUB}/script.js"
  n="$(curl -sS -m 25 "${PUB}/script.js" | grep -c "Array.isArray" || true)"
  echo "    grep -c Array.isArray -> ${n}（应为 >=1）"
  if [[ "${n}" == "0" ]]; then
    die "公网 script.js 仍像旧版本：请确认 Nginx root/proxy 是否指向 ${REMOTE_PATH}，或 CDN 是否缓存旧文件。"
  fi
  echo "==> 公网自检: ${PUB}/share.js"
  m="$(curl -sS -m 25 "${PUB}/share.js" | grep -c "officialPlatformUrl" || true)"
  echo "    grep -c officialPlatformUrl -> ${m}（应为 >=1）"
  if [[ "${m}" == "0" ]]; then
    die "公网 share.js 仍像旧版本：请确认分享页脚本已同步到 ${REMOTE_PATH}，或 CDN 是否缓存旧文件。"
  fi
fi

echo "OK 部署完成。"
