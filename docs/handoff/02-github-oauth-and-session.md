# GitHub OAuth、会话与常见故障

## 1. 授权与回调 URL（GitHub 侧）

在 GitHub OAuth App 的「Authorization callback URL」中配置：

`https://viby.ink/api/auth/github/callback`

须与后端用于换 token 的 `redirect_uri` **完全一致**（协议、主机、路径）。  
后端从 `PUBLIC_ORIGIN`（或反代头）推导 `origin`，再拼出上述 `redirect_uri`。

## 2. 浏览器内流程（简化）

1. 用户打开站点，点击「使用 GitHub 登录」→ 访问本站 `GET /api/auth/github`。
2. 服务端 `302` 到 `https://github.com/login/oauth/authorize?...`，并 **`Set-Cookie: viby_oauth_state=...`**（HttpOnly，短期）。
3. 用户在 GitHub 确认后，浏览器被重定向到  
   `https://viby.ink/api/auth/github/callback?code=...&state=...`。
4. 服务端校验 **`state` 与 Cookie 中 `viby_oauth_state` 一致**，用 `code` 换 `access_token`，拉用户信息，签发会话，再 **`302` 到** `/?github_login=success`，并设置 `viby_session`（HttpOnly）与 `viby_session_js`（可读，供 `X-Viby-Session` 同步）。

失败时较新版本会 `302` 到  
`/?github_login=failed&github_err=<reason>`，  
`reason` 为短键（如 `state`、`uri`、`code`、`secret`、`token`、`net`、`denied` 等），由前端映射成中文 Toast。

## 3. 核心生产故障：`www` 与裸域（`viby.ink`）的 Cookie 不共享

**现象**：用户始终无法完成登录，或只看到「GitHub 登录未完成…回调地址…Node 提供 /api」等兜底文案。

**原因**：

- 若用户从 **`https://www.viby.ink`** 点击登录，`viby_oauth_state` 默认可能是 **host-only**（仅 `www`）。
- GitHub 回调地址配置的是 **`https://viby.ink/...`（裸域）**。
- 回调请求发到 **裸域** 时，浏览器**不会**带上仅在 `www` 下发的 Cookie → **`state` 校验失败**。

**修复（必选其一或同时做）**：

1. 在 **`.env`** 增加：**`COOKIE_DOMAIN=.viby.ink`**（注意前导 `.`）。  
2. 或调整 Nginx：**所有访问（含 `/api`）从 www **301** 到裸域**（与示例配置一致）。  
3. 较新 **server.js**：若 `PUBLIC_ORIGIN=https://viby.ink` 且未设置 `COOKIE_DOMAIN`，可对**双段裸域**自动加 `.域名`；仍建议在 `.env` 显式写出以免误解。
4. **较新 server.js**：若设置了 `PUBLIC_ORIGIN`，对 **Host 与规范主机不一致** 的 **GET/HEAD**（含 `/`、`/api/auth/github` 等）会 **301** 到 `PUBLIC_ORIGIN` 同路径，使 OAuth 始终在规范主机上完成。关闭：`VIBY_DISABLE_CANONICAL_HOST_REDIRECT=1`。

## 4. 前端 Toast 与 `github_err`

`script.js` 中 `handleAuthRedirectMessage` 逻辑要点：

- `github_login=success`：若本地已无用户会话，会提示检查 Cookie/密钥。
- `github_login=not_configured`：未配 GitHub Client ID/Secret。
- **其它**（含 `failed`）：读取 `github_err`，在映射表中有则显示**具体原因**；**否则**显示一长段**兜底**文案（OAuth 回调 URL + Node `/api`）。  
  因此：**若总看到兜底文案**，常见是 **`github_err` 缺失**（旧版 `server.js` 重定向未带参数）或值不在映射表。

## 5. 会话与 `/api/me`

- 服务端会话 Cookie：`viby_session`（HttpOnly）+ `viby_session_js`（非 HttpOnly，同名令牌）。
- `GET /api/me`：接受 Cookie 与 **`X-Viby-Session`** 头（与同名字符串），用于部分环境下同步会话。
- **PM2 / 环境变量中的 `GITHUB_CLIENT_SECRET` 与 `.env` 不一致** 可能导致验签异常；可用 `VIBY_DOTENV_OVERRIDE` 强制以 `.env` 为准（见 `server.js` 与 `ecosystem.config.cjs`）。

## 6. 排查清单（给下一个 agent）

1. `curl https://viby.ink/api/health` → `ok`、`githubOAuthReady`。
2. `curl -I https://viby.ink/api/auth/github` → `302` + `Location: https://github.com/...` + `Set-Cookie: viby_oauth_state=...`。
3. 生产机：`grep oauthFailRedirect server.js` 有输出；`pm2 show viby` 的 **cwd** 是否为 `/var/www/viby`。
4. `.env`：`PUBLIC_ORIGIN`、`COOKIE_DOMAIN`、GitHub 密钥、`SESSION_SECRET`。
5. 登录失败时**复制完整 URL**（含 `github_err`），对照前端映射与 `server.js` 的 `oauthFailRedirect` 入参。
6. `pm2 logs viby` 中 `[viby] GitHub token`、`OAuth state` 相关日志。
