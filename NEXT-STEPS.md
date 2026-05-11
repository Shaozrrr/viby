# 你接下来要做什么（viby.ink）

**更细、带「在哪个网站怎么填」的步骤请看：[上线步骤-手把手.md](./上线步骤-手把手.md)。**

我在仓库里已经为你准备好：**Node 生产配置、Nginx 示例、PM2 常驻、自检命令**。下面这些步骤里，**只有带 ★ 的需要你在腾讯云 / GitHub 网页上手动点**，其余可复制命令。

---

## 阶段 A：你必须在网页上完成的（★）

1. **★ 腾讯云**  
   - 有一台 Linux 服务器（轻量或 CVM），安全组放行 **80、443**。  
   - 记下**公网 IP**。

2. **★ 域名解析**  
   在域名 DNS（腾讯云 DNSPod 或注册商）添加：  
   - 主机记录 `@`，类型 **A**，值 = 服务器公网 IP  
   - 等几分钟到几小时生效。

3. **★ GitHub OAuth App**  
   - 先登录 GitHub，再打开（地址栏不要多复制中文括号 `）`）：  
     `https://github.com/settings/applications/new`  
     或开发者总入口：`https://github.com/settings/developers`  
   - 找不到页面时请看 [上线步骤-手把手.md](./上线步骤-手把手.md) 里的「1.1 打开正确页面」。  
   - **Homepage URL**：`https://viby.ink`  
   - **Authorization callback URL**（必须一字不差）：  
     `https://viby.ink/api/auth/github/callback`  
   - 创建后得到 **Client ID**，再生成 **Client secrets**，两处都要复制保存（只显示一次）。

---

## 阶段 B：在服务器上执行（我可以把命令都写好，你 SSH 粘贴）

假设你用 Ubuntu，且已通过 SSH 登录服务器。

### 1）安装依赖（只需一次）

```bash
sudo apt update && sudo apt install -y nginx git curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### 2）把代码放到服务器

任选其一：

- `git clone <你的仓库地址> /var/www/viby && cd /var/www/viby`  
- 或把本机项目打包 `scp` / SFTP 上传到 `/var/www/viby`

### 3）配置环境变量

```bash
cd /var/www/viby   # 按你实际路径改
cp .env.example .env
nano .env
```

至少填：

```env
PORT=4184
HOST=127.0.0.1
PUBLIC_ORIGIN=https://viby.ink
GITHUB_CLIENT_ID=你的ClientID
GITHUB_CLIENT_SECRET=你的Secret
```

保存退出。

### 4）启动 Node（PM2）

```bash
cd /var/www/viby
bash scripts/pm2-start.sh
```

本机验证：

```bash
curl -s http://127.0.0.1:4184/api/health
```

应看到 `ok` 和 `githubOAuthReady: true`。

### 5）Nginx + HTTPS

**证书**（二选一）：

- 用 **certbot**：`sudo apt install -y certbot python3-certbot-nginx`，按向导签 `viby.ink`。  
- 或用 **腾讯云免费证书** 下载 Nginx 格式，放到例如 `/etc/nginx/ssl/viby.ink/`。

把仓库里的 `deploy/nginx-viby.ink.example.conf` 拷到服务器，改掉 **ssl_certificate** 两行路径，然后：

```bash
sudo cp deploy/nginx-viby.ink.example.conf /etc/nginx/sites-available/viby.ink
sudo ln -sf /etc/nginx/sites-available/viby.ink /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

> 配置里已有 `proxy_set_header X-Forwarded-Proto $scheme;`，HTTPS 登录 Cookie 依赖它。

### 6）浏览器验收

- 打开 `https://viby.ink`  
- 打开 `https://viby.ink/api/health`  
- 测 GitHub 登录

---

## 遇到问题先看这三条

| 现象 | 常见原因 |
|------|----------|
| `/api/health` 打不开 | 没用 `pm2`/Node，或 `HOST/PORT` 与 Nginx `proxy_pass` 不一致 |
| GitHub 登录失败、redirect_uri | 回调 URL 必须和 `PUBLIC_ORIGIN` 一致；不要混用 www 与裸域 |
| 登录后立刻掉线 | Nginx 没传 `X-Forwarded-Proto`，或 `PUBLIC_ORIGIN` 不是 https |

更细的说明见 [DEPLOY-TENCENT.md](./DEPLOY-TENCENT.md)。

---

## 我还能替你做什么（你回复我两样信息即可）

1. 你的服务器是 **轻量还是 CVM、系统是不是 Ubuntu 22.04**（或发 `lsb_release -a` 输出）  
2. 代码上云是准备 **git clone** 还是 **ZIP 上传**

我可以按你的实际情况，把上面命令改成**一条龙的复制版**（含目录名、是否用 www 跳转等）。
