# 在 GitHub 仓库里配置（Settings → Secrets and variables → Actions → New repository secret）
# 配置完成后：每次 push 到 main 分支会自动 rsync 到 VPS 并 pm2 restart，无需再 SSH 登录服务器。

## 必填

| Secret | 说明 |
|--------|------|
| `VPS_SSH_PRIVATE_KEY` | 整段私钥（含 `-----BEGIN … PRIVATE KEY-----` 与 `END` 行）。建议单独生成一对 **仅用于部署** 的密钥，公钥写入服务器 `~/.ssh/authorized_keys`。 |
| `VPS_HOST` | 服务器 IP 或主机名，例如 `1.2.3.4` |
| `VPS_USER` | SSH 用户名，例如 `ubuntu` 或 `root` |

## 可选

| Secret | 默认值 |
|--------|--------|
| `VPS_DEPLOY_PATH` | `/var/www/viby` |
| `VPS_PM2_APP` | `viby` |
| `VPS_ENV_B64` | 不设则沿用服务器现有 `.env`；若设置，则写入 base64 编码后的完整生产 `.env` 内容后再重启 PM2。 |
| `VIBY_PUBLIC_URL` | 不设则跳过公网自检。若设 `https://viby.ink`，部署后会 `curl` 公网 `script.js` 并检查是否含 `Array.isArray`。 |
