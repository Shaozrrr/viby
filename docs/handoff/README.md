# Viby 项目交接文档（Handoff）

面向后续接手的 AI agent 或开发者：下文按主题拆分，**请先读概览再按需跳转**。

| 文档 | 内容 |
|------|------|
| [01-production-deployment.md](./01-production-deployment.md) | VPS、目录、`/var/www/viby`、PM2、Nginx、`.env`、一键部署脚本、验证命令 |
| [02-github-oauth-and-session.md](./02-github-oauth-and-session.md) | GitHub OAuth 全流程、`www` 与裸域 Cookie 问题、`github_err`、常见问题排查 |
| [03-codebase-server-and-client.md](./03-codebase-server-and-client.md) | `server.js` / `script.js` 关键逻辑、会话签名、`/api` 路由 |
| [04-conversation-timeline-and-blockers.md](./04-conversation-timeline-and-blockers.md) | 历史对话里出现过的坑、已解决项、待确认项 |

**仓库（远程）**：`https://github.com/Shaozrrr/viby`（`main`）。

**生产域名**：`https://viby.ink`（同时存在 `https://www.viby.ink` 可访问 API 时，须特别注意 Cookie 域配置，见文档 02）。
