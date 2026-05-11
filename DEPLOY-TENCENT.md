# 将 Viby 部署到腾讯云域名 `viby.ink`

**最短操作清单请直接看仓库里的 [NEXT-STEPS.md](./NEXT-STEPS.md)。** 本文是更细的参考。

项目是 **Node 静态 + API**（`server.js`），需要一台能跑 Node 的机器，前面用 **Nginx 做 HTTPS**，不要用对象存储的「纯静态托管」替代整站，否则 GitHub 登录接口会 404。

## 1. 服务器

在腾讯云选 **轻量应用服务器** 或 **CVM**（Ubuntu 22.04 为例），开放 **80 / 443**。记下公网 IP。

## 2. 域名解析

在腾讯云 DNS（或域名注册商解析）为 **viby.ink** 添加记录：

- **A 记录**：主机记录 `@`，记录值填服务器公网 IP
- （可选）**A 记录**：`www` 同上，或做跳转见下文

解析生效后再申请证书。

## 3. 部署代码

```bash
sudo apt update && sudo apt install -y nginx git
# 安装 Node 20+（以 NodeSource 为例，或你习惯的方式）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

cd /var/www   # 或你喜欢的目录
# git clone <你的仓库> viby && cd viby
cd viby
cp .env.example .env
nano .env
```

在 `.env` 中至少配置：

```env
PORT=4184
HOST=127.0.0.1
PUBLIC_ORIGIN=https://viby.ink
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

- `HOST=127.0.0.1`：只本机访问，由 Nginx 对外；更安全。
- `PUBLIC_ORIGIN`：**必须与浏览器里打开的地址一致**（建议统一 `https://viby.ink`，不要用 IP 访问线上）。

测试启动：

```bash
npm start
# 另开终端：curl -s http://127.0.0.1:4184/api/health
```

用 **PM2** 常驻（推荐）：

```bash
sudo npm i -g pm2
cd /var/www/viby
pm2 start server.js --name viby
pm2 save
pm2 startup
```

## 4. HTTPS 证书

任选其一：

- **Let’s Encrypt**：`certbot --nginx -d viby.ink -d www.viby.ink`
- **腾讯云免费 SSL**：下载 Nginx 证书，放到例如 `/etc/nginx/ssl/viby.ink/`

## 5. Nginx

把仓库里 `deploy/nginx-viby.ink.example.conf` 复制为站点配置，修改 **ssl_certificate** 路径，软链到 `sites-enabled` 后：

```bash
sudo nginx -t && sudo systemctl reload nginx
```

务必保留配置中的：

```nginx
proxy_set_header X-Forwarded-Proto $scheme;
```

这样 Node 才能正确设置 **Secure Cookie**（HTTPS 登录必需）。

## 6. GitHub OAuth

打开 GitHub → Settings → Developer settings → OAuth Apps，把 **Authorization callback URL** 设为：

```text
https://viby.ink/api/auth/github/callback
```

若用户使用 **www.viby.ink** 访问，要么也把他们重定向到 apex，要么在 GitHub 再建一个回调（通常统一到 apex 更简单）。

## 7. 验收

- 浏览器打开 `https://viby.ink`，首页正常。
- `https://viby.ink/api/health` 返回 JSON，`githubOAuthReady` 为 `true`。
- 点击 GitHub 登录能回到站点且已登录。

## 说明

- 当前会话存在 **进程内存** 里，**重启 Node** 后所有人需重新登录；后续若要持久化可再加 Redis / 数据库。
- 邮箱验证码仍是前端演示逻辑；正式发信需接第三方邮件或腾讯云邮件。
