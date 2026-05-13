# 代码结构要点（server / script / 辅助脚本）

## 1. 仓库根目录关键文件

| 文件 | 作用 |
|------|------|
| `server.js` | HTTP 服务：静态文件 + `/api/*`、GitHub OAuth、签名会话、`/api/me`、`/api/health` |
| `script.js` | 首页交互、作品列表、`/api/me` 同步、`handleAuthRedirectMessage`、登录/个人页 UI |
| `index.html` | 页面结构；脚本 `script.js`、样式带 `?v=` 缓存戳 |
| `ecosystem.config.cjs` | PM2：`name: viby`，`cwd: __dirname`，`VIBY_DOTENV_OVERRIDE` |
| `deploy/nginx-viby.ink.example.conf` | Nginx 反代示例 |
| `.env.example` | 环境变量说明（含 `PUBLIC_ORIGIN`、`COOKIE_DOMAIN` 注释） |

## 2. `server.js`（逻辑摘要）

- **环境**：`loadEnv()` 读 `.env`；`dotenvOverrideKeys()` 在 `VIBY_DOTENV_OVERRIDE` 开启时让 `.env` 覆盖指定密钥（如 `GITHUB_CLIENT_SECRET`、`SESSION_SECRET`）。
- **对外 origin**：`getPublicOrigin(request)` 优先 `PUBLIC_ORIGIN`，否则 `X-Forwarded-Proto` + `Host`。
- **Cookie**：
  - `cookieDomainSuffix()`：`COOKIE_DOMAIN` 显式优先；否则在 `PUBLIC_ORIGIN` 为**双段裸域**时自动 `; Domain=.{hostname}`，使 **www 与裸域共享** OAuth state 与会话。
  - `sameSite=Lax`，HTTPS 时 `Secure`。
- **OAuth**：
  - `GET /api/auth/github` → `handleGitHubStart`：写 `viby_oauth_state`，重定向 GitHub。
  - `GET /api/auth/github/callback` → `handleGitHubCallback`：校验 `state` / `code`，`exchangeGitHubAccessToken`（`Accept: application/json`、`Content-Type: application/x-www-form-urlencoded`），失败走 `oauthFailRedirect(response, reason)` →  
    `/?github_login=failed&github_err=...`。
  - 成功：`/?github_login=success` + `Set-Cookie` 会话。
- **会话**：`signSessionUser` / `readUserFromVibySession`（HMAC + `exp`）；`SESSION_SECRET` 缺失时有开发用弱密钥警告。
- **路由**：`/api/me`、`/api/health`、`POST /api/logout`，其余 GET/HEAD 走 `serveStatic`。

## 3. `script.js`（与登录相关摘要）

- **`syncServerSession`**：`fetch("/api/me", { credentials: "include" })`，可选头 `X-Viby-Session: <viby_session_js>`；401 时清理本地 `authKey` 与 `viby_session_js` Cookie。
- **`handleAuthRedirectMessage`**：读 `github_login`、`github_err`，`showToast` 后 `history.replaceState` 去掉查询参数。
- **启动**：`ensureBackendProbe` → `syncServerSession` → 若 `github_login=success` 且已登录则可选打开资料面板。

## 4. 部署与补丁脚本

| 脚本 | 作用 |
|------|------|
| `scripts/fix-production-oauth.sh` | 从 `scripts/bundles/*.gz.b64` 还原 `server.js`/`script.js`，校验，`pm2 restart viby`，探测 `/api/health` |
| `scripts/generate-deploy-bundles.sh` | 开发机重新生成上述 `.gz.b64` |
| `scripts/patch-oauth-toast.cjs` | 无法 git 时，给**旧版** `script.js` 打补丁（`github_err` 文案等） |
| `scripts/selftest-auth.sh` | 本地 auth 冒烟（Cookie + 头） |

## 5. 给下一个 agent 的修改建议

- 改 OAuth / Cookie / 会话：**先通读** `server.js` 中 `handleGitHubCallback`、`cookieDomainSuffix`、`signSessionUser`。  
- 改失败提示：**对齐** `oauthFailRedirect` 的 `reason` 与 `script.js` 里 `byErr` 键。  
- 任何 `server.js` / `script.js` 发布到无 git 的环境：**记得** `bash scripts/generate-deploy-bundles.sh` 并提交 `scripts/bundles/`，或要求对方 `git pull`。
