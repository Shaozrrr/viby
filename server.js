const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 4184);
const sessions = new Map();
const sessionDir = path.join(root, "data");
const sessionFile = path.join(sessionDir, "sessions.json");

const persistSessions = () => {
  try {
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });
    fs.writeFileSync(sessionFile, JSON.stringify(Object.fromEntries(sessions), "utf8"));
  } catch (e) {
    console.warn("[viby] persist sessions:", e.message);
  }
};

const loadSessions = () => {
  try {
    if (!fs.existsSync(sessionFile)) return;
    const parsed = JSON.parse(fs.readFileSync(sessionFile, "utf8"));
    if (!parsed || typeof parsed !== "object") return;
    Object.entries(parsed).forEach(([id, payload]) => {
      if (payload && typeof payload === "object") sessions.set(id, payload);
    });
  } catch (e) {
    console.warn("[viby] load sessions:", e.message);
  }
};

loadSessions();

const loadEnv = () => {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const match = trimmed.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match || process.env[match[1]]) return;
    let value = match[2].replace(/^["']|["']$/g, "");
    const comment = value.indexOf(" #");
    if (comment !== -1) value = value.slice(0, comment).trim();
    process.env[match[1]] = value.trim();
  });
};

/** PM2 若已注入了错误的 GITHUB_CLIENT_SECRET，会导致与 OAuth 回调签名钥匙不一致、恒 401。设为 1 时强制以 .env 为准。 */
const dotenvOverrideKeys = () => {
  const flag = process.env.VIBY_DOTENV_OVERRIDE?.trim();
  if (!flag || flag === "0" || flag.toLowerCase() === "false") return;
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  const keys = new Set(
    String(process.env.VIBY_DOTENV_KEYS || "GITHUB_CLIENT_SECRET,SESSION_SECRET")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
  );
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const m = trimmed.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m || !keys.has(m[1])) return;
    let value = m[2].replace(/^["']|["']$/g, "");
    const comment = value.indexOf(" #");
    if (comment !== -1) value = value.slice(0, comment).trim();
    process.env[m[1]] = value.trim();
  });
  console.warn("[viby] VIBY_DOTENV_OVERRIDE 已启用：以下密钥已由 .env 覆盖：", [...keys].join(", "));
};

loadEnv();
dotenvOverrideKeys();

const getPublicOrigin = (request) => {
  const configured = process.env.PUBLIC_ORIGIN?.trim();
  if (configured) return configured.replace(/\/$/, "");
  const proto = (request.headers["x-forwarded-proto"] || "http").split(",")[0].trim();
  const host = request.headers["x-forwarded-host"] || request.headers.host;
  return `${proto}://${host}`;
};

/** Nginx 等反代需传 X-Forwarded-Proto: https，或在 .env 设置 PUBLIC_ORIGIN=https://viby.ink */
const isHttpsRequest = (request) => {
  const proto = (request.headers["x-forwarded-proto"] || "")
    .split(",")[0]
    .trim()
    .toLowerCase();
  if (proto === "https") return true;
  const configured = process.env.PUBLIC_ORIGIN?.trim();
  return Boolean(configured?.startsWith("https://"));
};

/**
 * www 与裸域混用时（例如从 www 点登录、GitHub 回到裸域 /callback），无 Domain 的 Cookie 不会随跨主机请求发送，
 * 会导致 OAuth state 恒失败。显式 COOKIE_DOMAIN=.viby.ink 可修复；未配置时若 PUBLIC_ORIGIN 为双段裸域则自动加 `.域名`。
 */
let cookieDomainSuffixMemo;
const cookieDomainSuffix = () => {
  if (cookieDomainSuffixMemo !== undefined) return cookieDomainSuffixMemo;
  const explicit = process.env.COOKIE_DOMAIN?.trim();
  let domain = explicit || "";
  if (!domain) {
    const po = process.env.PUBLIC_ORIGIN?.trim();
    if (po) {
      try {
        const { hostname } = new URL(po);
        const boring =
          hostname === "localhost" ||
          /^\d+\.\d+\.\d+\.\d+$/.test(hostname) ||
          hostname.endsWith(".local");
        const labels = hostname.split(".");
        if (!boring && labels.length === 2) domain = `.${hostname}`;
      } catch {
        /* ignore */
      }
    }
  }
  cookieDomainSuffixMemo = domain ? `; Domain=${domain}` : "";
  return cookieDomainSuffixMemo;
};

const cookieAttrsBase = (request) => {
  const secure = isHttpsRequest(request) ? "; Secure" : "";
  return `Path=/; SameSite=Lax${secure}${cookieDomainSuffix()}`;
};

/** OAuth state：防 CSRF，仅 HttpOnly */
const cookieAttrsOAuthState = (request) => `${cookieAttrsBase(request)}; HttpOnly`;

/** 会话主 Cookie：HttpOnly */
const cookieAttrsSessionHttpOnly = (request) => `${cookieAttrsBase(request)}; HttpOnly`;

/**
 * 会话镜像 Cookie：无 HttpOnly，供 document.cookie 读取。
 * 当反代/浏览器对 HttpOnly Cookie 与 fetch 行为异常时，可用 X-Viby-Session 回传同令牌。
 * （与把 token 放 localStorage 风险同级，勿引入 XSS。）
 */
const cookieAttrsSessionReadable = (request) => cookieAttrsBase(request);

/** @deprecated 兼容旧调用名，等价于 OAuth state */
const cookieAttrs = (request) => cookieAttrsOAuthState(request);

/** 会话签名密钥；与 GitHub secret 分离，但可回退到 GITHUB_CLIENT_SECRET 以免忘配 */
const sessionSecret = () => {
  const s = process.env.SESSION_SECRET?.trim() || process.env.GITHUB_CLIENT_SECRET?.trim();
  if (s) return s;
  console.warn("[viby] 未设置 SESSION_SECRET（或 GITHUB_CLIENT_SECRET），使用内置开发密钥。生产环境请配置 SESSION_SECRET");
  return "viby-dev-only-not-for-production";
};

const signSessionUser = (user, maxAgeMs = 30 * 24 * 60 * 60 * 1000) => {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    provider: user.provider,
    exp: Date.now() + maxAgeMs,
  };
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", sessionSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
};

const readUserFromVibySession = (raw) => {
  if (!raw || typeof raw !== "string") return null;
  const dot = raw.indexOf(".");
  if (dot < 1 || dot === raw.length - 1) return null;
  const body = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  let expect;
  try {
    expect = crypto.createHmac("sha256", sessionSecret()).update(body).digest("base64url");
  } catch {
    return null;
  }
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expect, "utf8");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (typeof parsed.exp === "number" && parsed.exp < Date.now()) return null;
    const { exp: _exp, ...user } = parsed;
    return user.id ? user : null;
  } catch {
    return null;
  }
};

const githubAvatarFromUserId = (id) => {
  const m = /^github-(\d+)$/.exec(id);
  return m ? `https://avatars.githubusercontent.com/u/${m[1]}?v=4` : "";
};

/** 签名 Cookie 里不存 avatar（防止超长被拒）；在此补全 */
const hydrateSessionUser = (user) => {
  if (!user?.id) return user;
  const out = { ...user };
  if (!out.avatar && out.provider === "github") {
    const derived = githubAvatarFromUserId(out.id);
    if (derived) out.avatar = derived;
  }
  return out;
};

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

const parseCookies = (request) => {
  const out = {};
  const raw = request.headers.cookie || "";
  raw.split(";").forEach((part) => {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq < 1) return;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (!key || !value) return;
    if (key === "viby_session" || key === "viby_session_js" || key === "viby_oauth_state") {
      out[key] = value;
      return;
    }
    try {
      value = decodeURIComponent(value);
    } catch {
      /* keep raw */
    }
    out[key] = value;
  });
  return out;
};

const sendJson = (response, status, body, options = {}) => {
  const headers = { "Content-Type": "application/json; charset=utf-8" };
  if (options.noStore) headers["Cache-Control"] = "no-store, must-revalidate";
  response.writeHead(status, headers);
  response.end(JSON.stringify(body));
};

const redirect = (response, location, headers = {}) => {
  response.writeHead(302, { Location: location, ...headers });
  response.end();
};

const readRequestBody = (request) =>
  new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });

const fetchGitHubJson = async (url, options) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      "User-Agent": "Viby",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub request failed: ${response.status}`);
  }

  return response.json();
};

/** GitHub token 接口在失败时仍可能返回 HTTP 200 + JSON error 字段，须单独解析 */
const exchangeGitHubAccessToken = async (bodyParams) => {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Viby",
    },
    body: new URLSearchParams(bodyParams),
  });

  let data;
  try {
    data = await response.json();
  } catch (e) {
    console.warn("[viby] GitHub token 响应非 JSON", response.status, e?.message || e);
    return { error: "parse", error_description: "non-json" };
  }

  if (!response.ok) {
    console.warn("[viby] GitHub token HTTP", response.status, data);
    return { error: "http", ...data };
  }

  if (data.error) {
    console.warn("[viby] GitHub token error", data.error, data.error_description || "");
    return data;
  }

  return data;
};

const oauthFailRedirect = (response, reason) => {
  redirect(response, `/?github_login=failed&github_err=${encodeURIComponent(reason)}`);
};

const handleGitHubStart = (request, response) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId || !process.env.GITHUB_CLIENT_SECRET) {
    redirect(response, "/?github_login=not_configured");
    return;
  }

  const origin = getPublicOrigin(request);
  const state = crypto.randomBytes(24).toString("hex");
  const redirectUri = `${origin}/api/auth/github/callback`;
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "read:user user:email");
  url.searchParams.set("state", state);

  response.statusCode = 302;
  response.setHeader("Location", url.toString());
  response.appendHeader("Set-Cookie", `viby_oauth_state=${state}; ${cookieAttrsOAuthState(request)}; Max-Age=600`);
  response.end();
};

const handleGitHubCallback = async (request, response, url) => {
  const denyError = url.searchParams.get("error");
  if (denyError) {
    oauthFailRedirect(response, denyError === "access_denied" ? "denied" : "github");
    return;
  }

  const cookies = parseCookies(request);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    oauthFailRedirect(response, "missing");
    return;
  }
  if (state !== cookies.viby_oauth_state) {
    console.warn("[viby] OAuth state 不一致（多为未带上 viby_oauth_state Cookie）", {
      hasCookie: Boolean(cookies.viby_oauth_state),
    });
    oauthFailRedirect(response, "state");
    return;
  }

  try {
    const origin = getPublicOrigin(request);
    const token = await exchangeGitHubAccessToken({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${origin}/api/auth/github/callback`,
    });

    if (!token.access_token) {
      let reason = "token";
      if (token.error === "bad_verification_code") reason = "code";
      else if (token.error === "redirect_uri_mismatch") reason = "uri";
      else if (token.error === "incorrect_client_credentials") reason = "secret";
      oauthFailRedirect(response, reason);
      return;
    }

    const [profile, emails] = await Promise.all([
      fetchGitHubJson("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${token.access_token}` },
      }),
      fetchGitHubJson("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${token.access_token}` },
      }).catch(() => []),
    ]);

    const primaryEmail =
      emails.find((email) => email.primary && email.verified)?.email ||
      emails.find((email) => email.verified)?.email ||
      profile.email ||
      `${profile.login}@users.noreply.github.com`;
    const user = {
      id: `github-${profile.id}`,
      email: primaryEmail,
      name: profile.name || profile.login,
      avatar: profile.avatar_url,
      provider: "github",
    };
    const sessionToken = signSessionUser(user);

    const maxAgeSec = 2592000;
    response.statusCode = 302;
    response.setHeader("Location", "/?github_login=success");
    response.appendHeader(
      "Set-Cookie",
      `viby_session=${sessionToken}; ${cookieAttrsSessionHttpOnly(request)}; Max-Age=${maxAgeSec}`,
    );
    response.appendHeader(
      "Set-Cookie",
      `viby_session_js=${sessionToken}; ${cookieAttrsSessionReadable(request)}; Max-Age=${maxAgeSec}`,
    );
    response.appendHeader("Set-Cookie", `viby_oauth_state=; ${cookieAttrsOAuthState(request)}; Max-Age=0`);
    response.end();
  } catch (e) {
    console.warn("[viby] OAuth callback 异常", e?.message || e);
    oauthFailRedirect(response, "net");
  }
};

const handleMe = (request, response) => {
  const cookies = parseCookies(request);
  const headerTok = (request.headers["x-viby-session"] || "").trim();
  const raw = cookies.viby_session || cookies.viby_session_js || headerTok;
  let user = raw ? readUserFromVibySession(raw) : null;
  if (!user && raw) user = sessions.get(raw) || null;
  user = user ? hydrateSessionUser(user) : null;
  sendJson(response, user ? 200 : 401, user ? { user } : { user: null }, { noStore: true });
};

const handleHealth = (response) => {
  sendJson(response, 200, {
    ok: true,
    githubOAuthReady: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
  }, { noStore: true });
};

const handleLogout = (request, response) => {
  const cookies = parseCookies(request);
  const raw = cookies.viby_session || cookies.viby_session_js;
  if (raw && !raw.includes(".")) {
    sessions.delete(raw);
    persistSessions();
  }
  response.statusCode = 204;
  response.appendHeader("Set-Cookie", `viby_session=; ${cookieAttrsSessionHttpOnly(request)}; Max-Age=0`);
  response.appendHeader("Set-Cookie", `viby_session_js=; ${cookieAttrsSessionReadable(request)}; Max-Age=0`);
  response.end();
};

/** 反代后的浏览器主机名（不含端口） */
const requestHostname = (request) => {
  const raw = (request.headers["x-forwarded-host"] || request.headers.host || "").split(",")[0].trim();
  return raw.split(":")[0].toLowerCase();
};

/**
 * PUBLIC_ORIGIN 与当前 Host 不一致时，对 GET/HEAD 统一 301 到规范主机。
 * 解决从 www 点「GitHub 登录」但回调在裸域导致 state Cookie 丢失的问题（不依赖 Nginx 是否已做 www 跳转）。
 * 关闭：环境变量 VIBY_DISABLE_CANONICAL_HOST_REDIRECT=1
 */
const tryCanonicalHostRedirect = (request, response, url) => {
  if (process.env.VIBY_DISABLE_CANONICAL_HOST_REDIRECT?.trim() === "1") return false;
  if (request.method !== "GET" && request.method !== "HEAD") return false;
  const po = process.env.PUBLIC_ORIGIN?.trim();
  if (!po) return false;
  let canon;
  try {
    canon = new URL(po);
  } catch {
    return false;
  }
  const canonHost = canon.hostname.toLowerCase();
  const reqHost = requestHostname(request);
  if (!reqHost || reqHost === canonHost) return false;
  const dest = `${canon.protocol}//${canonHost}${url.pathname}${url.search}`;
  response.writeHead(301, { Location: dest });
  response.end();
  return true;
};

const serveStatic = (request, response, url) => {
  const requestPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.normalize(path.join(root, requestPath));

  if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const ext = path.extname(filePath);
  /** HTML 带入口与 ?v= 引用，勿长期缓存，避免线上已更新但用户仍跑旧 script.js */
  const cacheControl =
    ext === ".html"
      ? "no-store, must-revalidate"
      : ext === ".js" || ext === ".css"
        ? "no-cache, must-revalidate"
        : "public, max-age=3600";

  response.writeHead(200, {
    "Content-Type": mimeTypes[ext] || "application/octet-stream",
    "Cache-Control": cacheControl,
  });
  fs.createReadStream(filePath).pipe(response);
};

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (tryCanonicalHostRedirect(request, response, url)) return;

  if (request.method === "GET" && url.pathname === "/api/auth/github") {
    handleGitHubStart(request, response);
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/auth/github/callback") {
    await handleGitHubCallback(request, response, url);
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/me") {
    handleMe(request, response);
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/health") {
    handleHealth(response);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/logout") {
    await readRequestBody(request);
    handleLogout(request, response);
    return;
  }

  if (request.method === "GET" || request.method === "HEAD") {
    serveStatic(request, response, url);
    return;
  }

  response.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("Method not allowed");
});

const host = process.env.HOST || "0.0.0.0";

server.listen(port, host, () => {
  const suffix = cookieDomainSuffix();
  if (suffix) {
    console.log(
      `[viby] Cookie${suffix}（www 与裸域共享会话；可用 COOKIE_DOMAIN= 覆盖或置空关闭自动域）`,
    );
  }
  const callbackUrl = process.env.PUBLIC_ORIGIN
    ? `${process.env.PUBLIC_ORIGIN.replace(/\/$/, "")}/api/auth/github/callback`
    : `http://localhost:${port}/api/auth/github/callback`;
  console.log(`Viby listening on http://${host}:${port}`);
  console.log(`GitHub OAuth「Authorization callback URL」填：${callbackUrl}`);
  if (!process.env.PUBLIC_ORIGIN?.trim()) {
    console.log("未设置 PUBLIC_ORIGIN。若走 HTTPS 反代，请在 .env 写入 PUBLIC_ORIGIN=https://你的域名，并让 Nginx 设置 X-Forwarded-Proto。");
  } else if (process.env.VIBY_DISABLE_CANONICAL_HOST_REDIRECT?.trim() !== "1") {
    try {
      const h = new URL(process.env.PUBLIC_ORIGIN.trim()).hostname;
      console.log(`[viby] GET/HEAD 若 Host≠${h} 将 301 到 PUBLIC_ORIGIN（OAuth 与 Cookie 一致）；关闭：VIBY_DISABLE_CANONICAL_HOST_REDIRECT=1`);
    } catch {
      /* ignore */
    }
  }
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    console.warn("[viby] GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET 未配置，GitHub 登录不可用");
  }
});
