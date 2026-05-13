# 对话时间线与已讨论问题（供续作上下文）

本文档压缩多轮对话中出现过的事实与结论，**不是严格的 git 历史**；若与代码冲突，以仓库当前文件为准。

## 1. 用户目标

- 站点：**Viby**（`viby.ink`），中文 vibe coding 作品社区。
- **GitHub 登录**须端到端可用；登录后头部行为应打开个人主页而非反复出现登录弹层（相关逻辑主要在 `script.js` 与会话同步）。
- **生产环境**：Ubuntu，项目路径常见为 **`/var/www/viby`**，**PM2** 应用名 **`viby`**，**Nginx** → **`127.0.0.1:4184`**（以 `.env` `PORT` 为准）。

## 2. 已实施或已 push 的代码方向

- **`server.js`**：带签名的 `viby_session` / `viby_session_js`；`/api/me` 支持 Cookie 与 `X-Viby-Session`；GitHub token 交换与错误处理；失败重定向 `oauthFailRedirect` → **`github_err`**；原始 Cookie 解析；`VIBY_DOTENV_OVERRIDE`；`PUBLIC_ORIGIN` 未设置时的启动提示等。
- **`COOKIE_DOMAIN` 自动推导**：当 `PUBLIC_ORIGIN` 为「双段裸域」且未设 `COOKIE_DOMAIN` 时，为 Cookie 添加 `Domain=.{hostname}`，缓解 **www 进、裸域回调** 导致 **OAuth state 失败**（详见 `02-github-oauth-and-session.md`）。
- **`script.js`**：`github_err` 映射中文 Toast；OAuth 后关闭登录 / 打开资料；登录按钮对已登录用户走资料页等（以仓库为准）。
- **`index.html`**：`script.js` / `styles.css` 带 `?v=` 缓存戳。
- **部署**：`scripts/fix-production-oauth.sh` + `scripts/bundles/*.gz.b64` + `scripts/generate-deploy-bundles.sh`；示例 Nginx；`.env.example` 注释扩展。
- **远程仓库**：`https://github.com/Shaozrrr/viby`，`main` 分支已包含上述提交。

## 3. 运维侧踩坑（对话中出现过）

- 把 **`proxy_set_header` / `proxy_pass` 粘到 shell** 里执行 → 报错；应写入 **Nginx 站点配置** 并 `nginx -t`、reload。
- **`.env` 里 `PUBLIC_ORIGIN` 被注释** → 回调 URL / 日志里曾出现 `localhost:4184` 与生产混用；需 **`PUBLIC_ORIGIN=https://viby.ink`**。
- 生产机 **`grep oauthFailRedirect server.js` 无输出** → 说明当时 **`server.js` 仍是旧文件** 或 PM2 **cwd/脚本路径不是你以为的那份**。
- 仅改前端或 base64 写错目录 → 现象仍为旧逻辑；应用 **`pm2 show viby`** 核对。
- **`patch-oauth-toast.cjs`** 在服务器缺失时曾无法执行；完整文件已在仓库 `scripts/`。

## 4. 外网探测结论（对话期间）

- `https://viby.ink/api/health` 曾返回 `{"ok":true,"githubOAuthReady":true}`。
- `GET https://viby.ink/api/auth/github` 返回 **302** 到 `github.com`，`redirect_uri` 为 `https://viby.ink/api/auth/github/callback`，并设置 **`viby_oauth_state`** Cookie。
- **`https://www.viby.ink`** 同样可访问 `/api/health` 与 `/api/auth/github`，与裸域并存时触发 **Cookie 域** 问题（已在文档 02 与代码中处理）。

## 5. 待其他 agent 可继续的事项

- 若用户仍失败：收集 **失败后的完整 URL**（`github_err`）、**`pm2 logs`**、**`pm2 show viby`**、**当前 `.env` 关键键（脱敏）**。
- 可选：统一 Nginx 策略（www 仅 301 到裸域），减少对 Cookie 域的依赖。
- 对比 **GitHub OAuth App** 的 callback URL 与 **`PUBLIC_ORIGIN`** 是否长期一致。

## 6. 用户原话需求（本次任务）

- 将前序对话记忆整理为 **多篇详细 Markdown**，供 **其他 agent** 继续修改 → 即本目录 `docs/handoff/*.md`。
