# 生产环境部署（VPS / PM2 / Nginx）

## 1. 术语：VPS 是什么

**VPS（Virtual Private Server）**：云厂商把一台物理机切出一小块资源给你，装 Ubuntu 等系统，你用 **SSH** 远程登录，在那上面跑 Node、Nginx、PM2。  
本项目的「线上」指的就是这台机器，不是开发用的 Mac。

## 2. 典型目录与进程

| 项 | 常见值 / 说明 |
|----|----------------|
| 项目根目录 | `/var/www/viby` |
| Node 入口 | `server.js`（PM2 的 `script` 一般指向此文件） |
| 环境变量文件 | `/var/www/viby/.env` |
| 进程管理 | **PM2**，应用名通常为 **`viby`** |
| Node 监听 | 常见 `127.0.0.1:4184`（以 `.env` 里 `PORT` 为准） |
| 反向代理 | **Nginx** 把 `https://viby.ink` 的请求转到本机 Node 端口 |

## 3. SSH 与编辑 `.env`

- **SSH**：本机终端执行 `ssh user@服务器IP`（用户可能是 `root` / `ubuntu` 等）。
- **编辑 `.env`**：例如  
  `cd /var/www/viby && nano .env`  
  保存后需重启 Node（见下）。

### 生产必配项（摘要）

- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`：与 GitHub OAuth App 一致。
- `PUBLIC_ORIGIN=https://viby.ink`：须与浏览器访问的主站 **协议+主机** 规划一致（见文档 02）。
- **`COOKIE_DOMAIN=.viby.ink`**：当用户可能从 **`www.viby.ink`** 进入而回调在 **`viby.ink`** 时**必填**（注意 **`.` 在前**，写作 `.viby.ink`，不是 `viby.ink`）。  
  较新版本的 `server.js` 在 `PUBLIC_ORIGIN` 为双段裸域且未设置 `COOKIE_DOMAIN` 时，会**自动**使用 `.裸域`，但仍建议在 `.env` 写明以免歧义。
- `SESSION_SECRET`：生产应设置随机长串；与会话验签相关。
- `PORT` / `HOST`：与 PM2、Nginx `proxy_pass` 一致。
- `VIBY_DOTENV_OVERRIDE=1`：若在 PM2 / 系统环境里误注入了与 `.env` 不一致的 `GITHUB_CLIENT_SECRET` 等，可在 `ecosystem.config.cjs` 里开启（仓库已倾向启用），强制以 `.env` 为准。

修改 `.env` 后：

```bash
cd /var/www/viby
pm2 restart viby
```

## 4. Nginx 要点

- **`/api/`** 必须反代到 Node，**不能**只把站点当纯静态文件；否则 GitHub 回调与 `/api/me` 不可用。
- 需传递（或等效）：
  - `Host`
  - `X-Forwarded-Proto`（HTTPS 场景常见为 `$scheme`）
  - `Cookie`（OAuth state 与会话 Cookie 依赖）
- 示例配置见仓库：`deploy/nginx-viby.ink.example.conf`。  
  示例中 **www 仅 301 到裸域**可避免双主机 Cookie 混乱；若线上 **www 仍直接提供** `/api`，则必须依赖 **`COOKIE_DOMAIN=.viby.ink`**（或统一 301）。

## 5. 从 GitHub 拉代码并一键覆盖前后端文件

仓库：`https://github.com/Shaozrrr/viby`。

```bash
cd /var/www/viby
sudo git pull origin main
sudo bash scripts/fix-production-oauth.sh /var/www/viby
```

`scripts/fix-production-oauth.sh` 会：

- 从 `scripts/bundles/*.gz.b64` 解压写入 `server.js`、`script.js`（带备份）
- `node --check`
- `pm2 restart viby`（或 `pm2 start ecosystem.config.cjs`）
- 尝试 `curl http://127.0.0.1:$PORT/api/health`

若服务器不能 `git pull`，可把本机的 `scripts/bundles` + `scripts/fix-production-oauth.sh` 拷到 VPS，执行：

```bash
sudo bash /path/to/fix-production-oauth.sh /var/www/viby /path/to/bundles
```

## 5b. 从本机一键同步到 VPS（推荐：不必再 SSH 登录服务器敲命令）

1. 本机已能一条命令登录服务器，例如：`ssh ubuntu@你的IP` 不需要再输入密码（先在本机执行一次 `ssh-copy-id ubuntu@你的IP`）。
2. 在仓库根目录复制配置：  
   `cp .env.deploy.example .env.deploy`  
   编辑 `.env.deploy`，填写 `VIBY_DEPLOY_SSH`、`VIBY_DEPLOY_PATH`；若要部署后自动检查公网脚本是否更新，加上 `VIBY_PUBLIC_URL=https://viby.ink`。
3. 在本机项目根执行：

```bash
npm run deploy:vps
```

脚本会用 **rsync** 把 `server.js`、`script.js`、`index.html`、`styles.css`、`works.*`、`ecosystem.config.cjs`、`package.json` 以及 `assets/`、`scripts/` 同步到远端目录，再 **ssh** 执行 `pm2 restart`。  
若设置了 `VIBY_PUBLIC_URL`，会在本机 `curl` 公网 `script.js` 并检查是否含 `Array.isArray`（为 0 则报错退出，便于发现 Nginx 指错目录或 CDN 缓存）。

`.env.deploy` 已加入 `.gitignore`，勿提交。

本地更新 `server.js` / `script.js` 后重新生成 bundle：

```bash
bash scripts/generate-deploy-bundles.sh
git add scripts/bundles && git commit -m "refresh deploy bundles"
```

## 6. 验证命令（生产机或本机对公网）

```bash
# 对外：API  alive 且 GitHub 密钥已配置
curl -sS https://viby.ink/api/health

# OAuth 入口应 302 到 github.com，且 Set-Cookie 含 viby_oauth_state
curl -sSI https://viby.ink/api/auth/github | head -20

# 确认公网拉到的 script.js 已是新版本（含 getStoredWorks 的 Array.isArray；旧包为 0）
curl -sS "https://viby.ink/script.js" | grep -c "Array.isArray" || true
wc -c /var/www/viby/script.js
```

生产机确认 **`server.js` 版本**（须含 `oauthFailRedirect` 与 `github_err`）：

```bash
grep -n oauthFailRedirect /var/www/viby/server.js | head
```

确认 PM2 使用的目录与脚本：

```bash
pm2 show viby
# 看 script path、exec cwd，避免改错目录的 server.js
```

## 7. 与对话相关的运维误区（摘录）

- **`proxy_set_header` 等属于 Nginx 配置文件**，不能当 shell 命令执行。
- **只改前端**或 **只粘贴 base64 改 `server.js` 但 PM2 cwd 指向别处**，会导致「grep 无输出 / 行为仍旧」；始终以 `pm2 show viby` 为准。
- 浏览器测试前建议 **强制刷新**（如 Mac `Cmd+Shift+R`），避免旧 `script.js` 缓存。
