#!/usr/bin/env node
/**
 * 在服务器上直接修好旧版 script.js 里「GitHub 登录未完成…npm start」文案，
 * 并补上 github_err 分支（不依赖 git pull）。
 *
 * 用法（在 /var/www/viby 下）：
 *   node scripts/patch-oauth-toast.cjs
 *   node scripts/patch-oauth-toast.cjs ./script.js
 */
const fs = require("fs");
const path = require("path");

const defaultScript =
  path.basename(__dirname) === "scripts"
    ? path.join(__dirname, "..", "script.js")
    : path.join(__dirname, "script.js");
const target = path.resolve(process.argv[2] || defaultScript);
let s = fs.readFileSync(target, "utf8");

if (s.includes('params.get("github_err")')) {
  console.log("OK: script.js 已包含 github_err，无需补丁。");
  process.exit(0);
}

const newElseBlock = `  } else {
    const glErr = params.get("github_err") || "";
    const origin = window.location.origin;
    const callbackUrl = \`\${origin}/api/auth/github/callback\`;
    const byErr = {
      state:
        "登录校验失败：浏览器未带上临时 Cookie。请关闭广告/隐私拦截、允许本站 Cookie，并全程用同一地址访问（例如 " +
        origin +
        "）。",
      missing: "缺少授权参数，请在本站重新点击「使用 GitHub 登录」。",
      code: "授权码已过期或无效，请再点一次 GitHub 登录。",
      uri: \`GitHub 提示回调地址不一致。请在 GitHub OAuth App 里将回调设为（完全一致）：\${callbackUrl}，且服务器 .env 中 PUBLIC_ORIGIN=\${origin}\`,
      secret: "GitHub 拒绝：Client ID 或 Client Secret 与后台不一致，请核对 .env 与 GitHub OAuth App。",
      token: "与 GitHub 交换令牌失败，可在服务器执行 pm2 logs viby 查看 [viby] GitHub token error。",
      net: "服务器处理登录时出错，请稍后重试或查看 pm2 logs。",
      denied: "你已取消 GitHub 授权，如需登录请重试。",
      github: "GitHub 返回错误，请稍后重试。",
    };
    showToast(
      byErr[glErr] ||
        \`GitHub 登录未完成。请确认 OAuth 回调地址为：\${callbackUrl}，且用 Node 提供 /api（勿纯静态托管）。\`,
    );
  }`;

// 旧版：多行 showToast（全角/半角括号两种常见写法）
const patterns = [
  /\} else \{\s*showToast\(\s*\n\s*"GitHub 登录未完成。常见原因：① 未用 npm start 打开站点；② OAuth 回调地址与当前网址不一致（localhost 与 127\.0\.0\.1 不能混用）",\s*\n\s*\);\s*\n\s*\}/,
  /\} else \{\s*showToast\(\s*\n\s*"GitHub 登录未完成。常见原因：① 未用 npm start 打开站点；② OAuth 回调地址与当前网址不一致 \(localhost 与 127\.0\.0\.1 不能混用）",\s*\n\s*\);\s*\n\s*\}/,
  /\} else \{\s*showToast\(\s*"GitHub 登录未完[^"]*",\s*\);\s*\}/,
];

let patched = false;
for (const re of patterns) {
  if (re.test(s)) {
    s = s.replace(re, newElseBlock);
    patched = true;
    break;
  }
}

if (!patched) {
  console.error("未匹配到旧的 else { showToast(...) } 块。请打开 script.js 搜索 handleAuthRedirectMessage 手动替换。");
  process.exit(1);
}

if (!s.includes('params.delete("github_err")')) {
  s = s.replace(
    /params\.delete\("github_login"\);\s*\n/,
    'params.delete("github_login");\n  params.delete("github_err");\n',
  );
}

fs.writeFileSync(target, s, "utf8");
console.log("OK: 已写入", target);
console.log('请执行: grep -n "github_err"', target, "| head -3");
