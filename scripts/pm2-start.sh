#!/usr/bin/env bash
# 在服务器项目根目录执行：bash scripts/pm2-start.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "缺少 .env。请先：cp .env.example .env 并编辑填好密钥与 PUBLIC_ORIGIN。"
  exit 1
fi

npm run check

if ! command -v pm2 >/dev/null 2>&1; then
  echo "正在全局安装 pm2..."
  npm install -g pm2
fi

pm2 delete viby 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
echo ""
echo "已启动。本机自检：curl -s http://127.0.0.1:4184/api/health"
echo "查看日志：pm2 logs viby"
