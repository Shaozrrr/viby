#!/usr/bin/env bash
# 一键：拉取 main → 校验 →（有改动则）提交 → 推送到 GitHub →（若存在 .env.deploy）部署到 VPS。
# 用法：
#   npm run publish
#   PUBLISH_MSG="fix: 登录与作品区" npm run publish
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

die() {
  echo "ERROR: $*" >&2
  exit 1
}

echo "==> git: pull --rebase origin/main"
git fetch origin main
git pull --rebase origin main

echo "==> npm: check"
npm run check

if [[ -n "$(git status --porcelain)" ]]; then
  echo "==> git: commit（设置 PUBLISH_MSG=说明 可改提交说明）"
  git add -A
  if git diff --cached --quiet; then
    echo "（仅有被忽略或未跟踪的变更，跳过提交）"
  else
    msg="${PUBLISH_MSG:-chore: publish $(date -u +"%Y-%m-%d %H:%M UTC")}"
    GIT_EDITOR=true git commit -m "$msg"
  fi
else
  echo "==> git: 工作区干净，跳过提交"
fi

echo "==> git: push"
git push origin HEAD

if [[ -f "$ROOT/.env.deploy" ]]; then
  echo "==> deploy: VPS（.env.deploy 已配置）"
  npm run deploy:vps
else
  echo "OK 已推送到 GitHub。未找到 .env.deploy，跳过 VPS；需要自动部署请: cp .env.deploy.example .env.deploy 并填写。"
fi

echo "OK publish 完成。"
