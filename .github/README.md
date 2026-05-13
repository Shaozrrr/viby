# 部署到 VPS（GitHub Actions）

在仓库 **Settings → Secrets and variables → Actions** 中按 **[DEPLOY-SECRETS.md](./DEPLOY-SECRETS.md)** 填写密钥后，**每次 push 到 `main`** 会自动把站点文件同步到服务器并执行 `pm2 restart`。

也可在 **Actions** 页手动运行 **Deploy to VPS**（`workflow_dispatch`）。

## 服务器一次性准备

1. 在 VPS 上创建仅用于部署的 SSH 公钥对应的用户，或把 GitHub Actions 使用的公钥写入 `~/.ssh/authorized_keys`。
2. 部署用户对该目录有写权限：`VPS_DEPLOY_PATH`（默认 `/var/www/viby`）。
3. 已安装 `pm2` 与 `node`，且应用已用 `ecosystem.config.cjs` 创建过（首次可仍在本机 `npm run deploy:vps` 或 SSH 跑一次 `pm2 start`）。

## 与「只改 GitHub」的关系

- **域名 DNS** 仍指向 **VPS**；不是指向 GitHub。
- **GitHub** 只负责：存代码 + CI 在 push 时帮你 **SSH 到 VPS 更新文件**。
- 若未配置上述 Secrets，workflow 会失败；此时仍可用本机 `npm run publish` 或 `npm run deploy:vps`。
