const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 4184);
const sessions = new Map();
const shares = new Map();
const works = new Map();
const profiles = new Map();
const reports = new Map();
const accounts = new Map();
const domainPolicies = new Map();
const emailCodes = new Map();
const sessionDir = path.join(root, "data");
const sessionFile = path.join(sessionDir, "sessions.json");
const shareFile = path.join(sessionDir, "shares.json");
const worksFile = path.join(sessionDir, "works.json");
const profilesFile = path.join(sessionDir, "profiles.json");
const reportsFile = path.join(sessionDir, "reports.json");
const accountsFile = path.join(sessionDir, "accounts.json");
const domainPoliciesFile = path.join(sessionDir, "domain-policies.json");
const auditLogFile = path.join(sessionDir, "audit.log");

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

const persistShares = () => {
  try {
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });
    fs.writeFileSync(shareFile, JSON.stringify(Object.fromEntries(shares), null, 2), "utf8");
  } catch (e) {
    console.warn("[viby] persist shares:", e.message);
  }
};

const loadShares = () => {
  try {
    if (!fs.existsSync(shareFile)) return;
    const parsed = JSON.parse(fs.readFileSync(shareFile, "utf8"));
    if (!parsed || typeof parsed !== "object") return;
    Object.entries(parsed).forEach(([id, payload]) => {
      if (payload && typeof payload === "object") shares.set(id, payload);
    });
  } catch (e) {
    console.warn("[viby] load shares:", e.message);
  }
};

loadShares();

const persistWorks = () => {
  try {
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });
    fs.writeFileSync(worksFile, JSON.stringify(Object.fromEntries(works), null, 2), "utf8");
  } catch (e) {
    console.warn("[viby] persist works:", e.message);
  }
};

const loadWorks = () => {
  try {
    if (!fs.existsSync(worksFile)) return;
    const parsed = JSON.parse(fs.readFileSync(worksFile, "utf8"));
    if (!parsed || typeof parsed !== "object") return;
    Object.entries(parsed).forEach(([id, payload]) => {
      if (payload && typeof payload === "object") works.set(id, payload);
    });
  } catch (e) {
    console.warn("[viby] load works:", e.message);
  }
};

loadWorks();

const persistProfiles = () => {
  try {
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });
    fs.writeFileSync(profilesFile, JSON.stringify(Object.fromEntries(profiles), null, 2), "utf8");
  } catch (e) {
    console.warn("[viby] persist profiles:", e.message);
  }
};

const loadProfiles = () => {
  try {
    if (!fs.existsSync(profilesFile)) return;
    const parsed = JSON.parse(fs.readFileSync(profilesFile, "utf8"));
    if (!parsed || typeof parsed !== "object") return;
    Object.entries(parsed).forEach(([id, payload]) => {
      if (payload && typeof payload === "object") profiles.set(id, payload);
    });
  } catch (e) {
    console.warn("[viby] load profiles:", e.message);
  }
};

loadProfiles();

const persistReports = () => {
  try {
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });
    fs.writeFileSync(reportsFile, JSON.stringify(Object.fromEntries(reports), null, 2), "utf8");
  } catch (e) {
    console.warn("[viby] persist reports:", e.message);
  }
};

const loadReports = () => {
  try {
    if (!fs.existsSync(reportsFile)) return;
    const parsed = JSON.parse(fs.readFileSync(reportsFile, "utf8"));
    if (!parsed || typeof parsed !== "object") return;
    Object.entries(parsed).forEach(([id, payload]) => {
      if (payload && typeof payload === "object") reports.set(id, payload);
    });
  } catch (e) {
    console.warn("[viby] load reports:", e.message);
  }
};

loadReports();

const persistAccounts = () => {
  try {
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });
    fs.writeFileSync(accountsFile, JSON.stringify(Object.fromEntries(accounts), null, 2), "utf8");
  } catch (e) {
    console.warn("[viby] persist accounts:", e.message);
  }
};

const loadAccounts = () => {
  try {
    if (!fs.existsSync(accountsFile)) return;
    const parsed = JSON.parse(fs.readFileSync(accountsFile, "utf8"));
    if (!parsed || typeof parsed !== "object") return;
    Object.entries(parsed).forEach(([id, payload]) => {
      if (payload && typeof payload === "object") accounts.set(id, payload);
    });
  } catch (e) {
    console.warn("[viby] load accounts:", e.message);
  }
};

loadAccounts();

const persistDomainPolicies = () => {
  try {
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });
    fs.writeFileSync(domainPoliciesFile, JSON.stringify(Object.fromEntries(domainPolicies), null, 2), "utf8");
  } catch (e) {
    console.warn("[viby] persist domain policies:", e.message);
  }
};

const loadDomainPolicies = () => {
  try {
    if (!fs.existsSync(domainPoliciesFile)) return;
    const parsed = JSON.parse(fs.readFileSync(domainPoliciesFile, "utf8"));
    if (!parsed || typeof parsed !== "object") return;
    Object.entries(parsed).forEach(([id, payload]) => {
      if (payload && typeof payload === "object") domainPolicies.set(id, payload);
    });
  } catch (e) {
    console.warn("[viby] load domain policies:", e.message);
  }
};

loadDomainPolicies();

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

const safeTrim = (value) => String(value || "").trim();

const slugify = (value) =>
  safeTrim(value)
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");

const dedupeTextList = (items, maxItems = 16, maxLength = 160) =>
  [...new Set((Array.isArray(items) ? items : []).map((item) => safeTrim(item)).filter(Boolean))]
    .slice(0, maxItems)
    .map((item) => item.slice(0, maxLength));

const dedupePhotos = (items, maxItems = 5) =>
  [...new Set((Array.isArray(items) ? items : []).map((item) => safeTrim(item)).filter(Boolean))].slice(0, maxItems);

const parseBooleanish = (value) => {
  if (typeof value === "boolean") return value;
  const raw = safeTrim(value).toLowerCase();
  return ["1", "true", "yes", "on", "checked", "ok"].includes(raw);
};

const oneHourMs = 60 * 60 * 1000;
const oneDayMs = 24 * oneHourMs;
const viewDedupWindowMs = 6 * oneHourMs;
const threatIntelCacheMs = 30 * 60 * 1000;
const openPhishRefreshMs = 12 * oneHourMs;
const rateBuckets = new Map();
const recentViews = new Map();
const threatIntelCache = new Map();
const openPhishState = {
  loadedAt: 0,
  loading: null,
  urls: new Set(),
};
const reservedProfileTerms = [/^viby$/i, /^微步$/i, /official/i, /官方/, /admin/i, /support/i, /客服/];
const disposableEmailDomains = new Set([
  "10minutemail.com",
  "10minutemail.net",
  "dispostable.com",
  "guerrillamail.com",
  "mailinator.com",
  "sharklasers.com",
  "tempmail.com",
  "temp-mail.org",
  "yopmail.com",
  "getnada.com",
  "maildrop.cc",
]);
const urlShortenerHosts = new Set([
  "bit.ly",
  "tinyurl.com",
  "t.cn",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "cutt.ly",
  "reurl.cc",
  "tiny.one",
  "su.pr",
  "s.id",
  "shorturl.at",
]);
const contactOnlyHosts = new Set(["t.me", "telegram.me", "discord.gg", "wa.me", "line.me"]);
const riskyTlds = new Set(["click", "country", "download", "gq", "loan", "men", "mom", "party", "review", "shop", "top", "vip", "work", "xyz"]);
const blockedPrimaryExtensions = new Set(["apk", "bat", "bin", "crx", "dmg", "exe", "ipa", "msi", "pkg", "rar", "sh", "zip"]);
const allowedImageDataMimeTypes = new Set([
  "image/gif",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/svg+xml",
  "image/webp",
]);
const strongBlockedPatterns = [
  /助记词|私钥|seed phrase|mnemonic|private key/i,
  /博彩|赌博|赌场|彩票|娱乐城|真人荷官/i,
  /裸聊|约炮|成人直播|陪聊/i,
  /代充|刷单|高返利|秒下款|黑户贷款/i,
];
const suspiciousContentPatterns = [
  { pattern: /telegram|whatsapp|wechat|vx|v信|加群|联系客服|官方客服/i, score: 2, reason: "文案带有强导流联系信息" },
  { pattern: /空投|领币|钱包验证|wallet ?connect|充值返利|返现|推广码/i, score: 3, reason: "文案包含高风险金融或钱包诱导词" },
  { pattern: /稳赚|躺赚|暴富|套利|稳赚不赔|稳定收益/i, score: 3, reason: "文案含夸张收益承诺" },
  { pattern: /优惠券|折扣群|代理招募|课程分销|加v咨询/i, score: 2, reason: "文案更像广告引流而非作品展示" },
];
const securityHeaders = {
  "Content-Security-Policy":
    "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; frame-src 'none'",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

const hashValue = (value) =>
  crypto.createHash("sha256").update(String(value || "")).digest("hex").slice(0, 24);

const normalizeIp = (value) => safeTrim(value).replace(/^::ffff:/, "") || "0.0.0.0";

const getClientIp = (request) =>
  normalizeIp(
    String(request.headers["x-forwarded-for"] || "")
      .split(",")[0]
      .trim() || request.socket?.remoteAddress || "",
  );

const getIpHash = (request) => hashValue(getClientIp(request));

const normalizeHostname = (hostname) => safeTrim(hostname).toLowerCase().replace(/\.$/, "");

const normalizeDomainKey = (hostname) => {
  const normalized = normalizeHostname(hostname).replace(/^www\./, "");
  if (!normalized) return "";
  const parts = normalized.split(".");
  return parts.length <= 2 ? normalized : parts.slice(-2).join(".");
};

const isIpHost = (hostname) => /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname);

const isPrivateIpHost = (hostname) => {
  if (!isIpHost(hostname)) return false;
  const [a = 0, b = 0] = hostname.split(".").map((part) => Number.parseInt(part, 10) || 0);
  return a === 10 || a === 127 || a === 0 || (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31);
};

const isGithubHost = (hostname) => ["github.com", "www.github.com", "gist.github.com"].includes(hostname);
const isAppStoreHost = (hostname) => ["apps.apple.com", "appsto.re"].includes(hostname);

const estimateBase64Bytes = (input) => {
  const raw = safeTrim(input).replace(/\s+/g, "");
  if (!raw) return 0;
  const padding = raw.endsWith("==") ? 2 : raw.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((raw.length * 3) / 4) - padding);
};

const sanitizeImageAsset = (value, { label = "图片", maxDataUrlBytes = 4 * 1024 * 1024 } = {}) => {
  const raw = safeTrim(value);
  if (!raw) return { ok: true, value: "" };

  if (/^(?:\.\/|\/)[^<>"'\s]+$/.test(raw)) {
    return { ok: true, value: raw.slice(0, 2048) };
  }

  if (raw.startsWith("data:")) {
    const match = /^data:([^;,]+);base64,(.+)$/i.exec(raw);
    if (!match) return { ok: false, error: `${label} 格式不受支持，请重新上传` };
    const mimeType = safeTrim(match[1]).toLowerCase();
    if (!allowedImageDataMimeTypes.has(mimeType)) {
      return { ok: false, error: `${label} 仅支持 PNG、JPEG、WebP 或 GIF` };
    }
    if (estimateBase64Bytes(match[2]) > maxDataUrlBytes) {
      return { ok: false, error: `${label} 体积过大，请压缩后再上传` };
    }
    return { ok: true, value: raw };
  }

  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    return { ok: false, error: `${label} 地址格式不正确` };
  }
  if (parsed.protocol !== "https:") {
    return { ok: false, error: `${label} 外链必须使用 HTTPS` };
  }
  return { ok: true, value: parsed.toString() };
};

const sanitizeImageList = (items, { label = "图片", maxItems = 5, maxDataUrlBytes = 4 * 1024 * 1024 } = {}) => {
  const normalized = [];
  for (const entry of Array.isArray(items) ? items : []) {
    const checked = sanitizeImageAsset(entry, { label, maxDataUrlBytes });
    if (!checked.ok) return { ok: false, error: checked.error, items: [] };
    if (checked.value) normalized.push(checked.value);
  }
  return { ok: true, items: dedupePhotos(normalized, maxItems) };
};

const fetchWithTimeout = async (url, options = {}, timeoutMs = 1800) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const getThreatIntelProviderSummary = () => ({
  googleSafeBrowsing: Boolean(process.env.GOOGLE_SAFE_BROWSING_API_KEY || process.env.SAFE_BROWSING_API_KEY),
  phishTank:
    process.env.PHISHTANK_DISABLED === "1"
      ? false
      : Boolean(safeTrim(process.env.PHISHTANK_APP_KEY) || process.env.PHISHTANK_ALLOW_NO_KEY === "1"),
  openPhish: process.env.OPENPHISH_DISABLED === "1" ? false : true,
});

const checkGoogleSafeBrowsing = async (url) => {
  const apiKey = safeTrim(process.env.GOOGLE_SAFE_BROWSING_API_KEY || process.env.SAFE_BROWSING_API_KEY);
  if (!apiKey) return { configured: false, matched: false, reasons: [], source: "google_safe_browsing" };
  const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${encodeURIComponent(apiKey)}`;
  const payload = {
    client: { clientId: "viby", clientVersion: "1.0.0" },
    threatInfo: {
      threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [{ url }],
    },
  };
  try {
    const response = await fetchWithTimeout(
      endpoint,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      5000,
    );
    if (!response.ok) {
      return { configured: true, matched: false, reasons: [], source: "google_safe_browsing", error: `http_${response.status}` };
    }
    const result = await response.json().catch(() => ({}));
    const matches = Array.isArray(result.matches) ? result.matches : [];
    return {
      configured: true,
      matched: matches.length > 0,
      reasons: matches.length ? ["Google Safe Browsing 标记该链接存在已知恶意风险"] : [],
      source: "google_safe_browsing",
      rawMatches: matches.length,
    };
  } catch (error) {
    return { configured: true, matched: false, reasons: [], source: "google_safe_browsing", error: error?.name || "request_failed" };
  }
};

const checkPhishTank = async (url) => {
  const appKey = safeTrim(process.env.PHISHTANK_APP_KEY);
  const allowNoKey = process.env.PHISHTANK_ALLOW_NO_KEY === "1";
  if (process.env.PHISHTANK_DISABLED === "1" || (!appKey && !allowNoKey)) {
    return { configured: false, matched: false, reasons: [], source: "phishtank" };
  }
  const body = new URLSearchParams({ url, format: "json" });
  if (appKey) body.set("app_key", appKey);
  try {
    const response = await fetchWithTimeout(
      "http://checkurl.phishtank.com/checkurl/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "viby/threat-check",
        },
        body: body.toString(),
      },
      1800,
    );
    if (!response.ok) {
      return { configured: true, matched: false, reasons: [], source: "phishtank", error: `http_${response.status}` };
    }
    const result = await response.json().catch(() => ({}));
    const payload = result.results || {};
    const valid = payload.valid === true || payload.valid === "y";
    return {
      configured: true,
      matched: Boolean(payload.in_database && valid),
      reasons: payload.in_database && valid ? ["PhishTank 命中已验证钓鱼站点"] : [],
      source: "phishtank",
    };
  } catch (error) {
    return { configured: true, matched: false, reasons: [], source: "phishtank", error: error?.name || "request_failed" };
  }
};

const ensureOpenPhishFeed = async () => {
  if (process.env.OPENPHISH_DISABLED === "1") return false;
  const now = Date.now();
  if (openPhishState.urls.size && openPhishState.loadedAt > now - openPhishRefreshMs) return true;
  if (openPhishState.loading) return openPhishState.loading;
  openPhishState.loading = (async () => {
    try {
      const response = await fetchWithTimeout(
        safeTrim(process.env.OPENPHISH_FEED_URL) || "https://openphish.com/feed.txt",
        {
          headers: { "User-Agent": "viby/openphish-feed" },
        },
        1800,
      );
      if (!response.ok) throw new Error(`http_${response.status}`);
      const text = await response.text();
      const urls = new Set(
        text
          .split(/\r?\n/)
          .map((line) => safeTrim(line))
          .filter(Boolean),
      );
      openPhishState.urls = urls;
      openPhishState.loadedAt = Date.now();
      return true;
    } catch {
      return false;
    } finally {
      openPhishState.loading = null;
    }
  })();
  return openPhishState.loading;
};

const checkOpenPhish = async (url) => {
  const configured = process.env.OPENPHISH_DISABLED === "1" ? false : true;
  if (!configured) return { configured: false, matched: false, reasons: [], source: "openphish" };
  const loaded = await ensureOpenPhishFeed();
  if (!loaded) return { configured: true, matched: false, reasons: [], source: "openphish", error: "feed_unavailable" };
  const matched = openPhishState.urls.has(url);
  return {
    configured: true,
    matched,
    reasons: matched ? ["OpenPhish 社区情报命中可疑钓鱼链接"] : [],
    source: "openphish",
  };
};

const lookupThreatIntel = async (url) => {
  const normalized = safeTrim(url);
  if (!normalized) {
    return { status: "unknown", reasons: [], sources: [], checks: [], checkedAt: Date.now() };
  }
  const cached = threatIntelCache.get(normalized);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const checks = await Promise.all([checkGoogleSafeBrowsing(normalized), checkPhishTank(normalized), checkOpenPhish(normalized)]);
  const matchedChecks = checks.filter((item) => item.matched);
  const configuredChecks = checks.filter((item) => item.configured);
  const value = {
    status: matchedChecks.length ? "malicious" : configuredChecks.length ? "clean" : "unknown",
    reasons: dedupeTextList(matchedChecks.flatMap((item) => item.reasons), 8, 120),
    sources: dedupeTextList(matchedChecks.map((item) => item.source), 6, 80),
    checks,
    checkedAt: Date.now(),
  };
  threatIntelCache.set(normalized, { expiresAt: Date.now() + threatIntelCacheMs, value });
  return value;
};

const mergeThreatIntelIntoWork = (work, verdict, fieldPrefix = "url") => {
  if (!work || !verdict || verdict.status !== "malicious") return work;
  const next = { ...work };
  const reasonsKey = fieldPrefix === "github" ? "githubSafetyReasons" : "urlSafetyReasons";
  const levelKey = fieldPrefix === "github" ? "githubSafetyLevel" : "urlSafetyLevel";
  next[reasonsKey] = dedupeTextList([...(next[reasonsKey] || []), ...verdict.reasons], 10, 120);
  next[levelKey] = "caution";
  next.moderationStatus = "blocked";
  next.moderationReasons = dedupeTextList(
    [...(next.moderationReasons || []), ...verdict.reasons, "外部安全情报源判定该链接存在恶意风险"],
    10,
    120,
  );
  next.riskScore = Math.max(7, Number(next.riskScore) || 0);
  next.threatIntelStatus = verdict.status;
  next.threatIntelSources = verdict.sources;
  next.threatIntelCheckedAt = verdict.checkedAt;
  return next;
};

const getDomainPolicy = (hostname) => domainPolicies.get(normalizeDomainKey(hostname)) || null;

const setDomainPolicy = (hostname, patch = {}) => {
  const domainKey = normalizeDomainKey(hostname);
  if (!domainKey) return null;
  const next = {
    domain: domainKey,
    status: patch.status || "blocked",
    reason: safeTrim(patch.reason).slice(0, 200),
    source: safeTrim(patch.source || "manual").slice(0, 40) || "manual",
    updatedAt: patch.updatedAt || Date.now(),
  };
  domainPolicies.set(domainKey, next);
  persistDomainPolicies();
  return next;
};

const readAccountState = (user) => {
  if (!user?.id) return null;
  const existing = accounts.get(user.id);
  const emailDomain = normalizeEmail(user.email).split("@")[1] || "";
  const next = {
    createdAt: existing?.createdAt || Date.now(),
    email: normalizeEmail(user.email),
    emailDomain,
    lastLoginAt: existing?.lastLoginAt || 0,
    loginCount: Number(existing?.loginCount) || 0,
    provider: safeTrim(existing?.provider || user.provider || "email") || "email",
    publishCount: Number(existing?.publishCount) || 0,
    pendingCount: Number(existing?.pendingCount) || 0,
    blockedCount: Number(existing?.blockedCount) || 0,
    strikes: Number(existing?.strikes) || 0,
    lastIpHash: safeTrim(existing?.lastIpHash),
    reviewNotes: dedupeTextList(existing?.reviewNotes || [], 12, 120),
    trustFlags: dedupeTextList(existing?.trustFlags || [], 16, 64),
  };
  accounts.set(user.id, next);
  return next;
};

const persistAccountState = (user, patch = {}) => {
  const current = readAccountState(user);
  if (!current) return null;
  const next = {
    ...current,
    ...patch,
    reviewNotes: dedupeTextList(patch.reviewNotes || current.reviewNotes || [], 12, 120),
    trustFlags: dedupeTextList(patch.trustFlags || current.trustFlags || [], 16, 64),
  };
  accounts.set(user.id, next);
  persistAccounts();
  return next;
};

const markAccountStrike = (user, reason) => {
  const current = readAccountState(user);
  if (!current) return null;
  return persistAccountState(user, {
    strikes: (Number(current.strikes) || 0) + 1,
    reviewNotes: [...(current.reviewNotes || []), safeTrim(reason).slice(0, 120)],
  });
};

const markAccountStrikeById = (userId, reason) => {
  const existing = accounts.get(userId);
  if (!existing) return null;
  const next = {
    ...existing,
    strikes: (Number(existing.strikes) || 0) + 1,
    reviewNotes: dedupeTextList([...(existing.reviewNotes || []), safeTrim(reason).slice(0, 120)], 12, 120),
  };
  accounts.set(userId, next);
  persistAccounts();
  return next;
};

const registerLogin = (user, request) => {
  const current = readAccountState(user);
  if (!current) return;
  persistAccountState(user, {
    lastLoginAt: Date.now(),
    loginCount: (Number(current.loginCount) || 0) + 1,
    provider: user.provider || current.provider,
    email: normalizeEmail(user.email),
    emailDomain: normalizeEmail(user.email).split("@")[1] || "",
    lastIpHash: getIpHash(request),
  });
};

const consumeRateLimit = (key, limit, windowMs) => {
  const now = Date.now();
  const existing = rateBuckets.get(key);
  if (!existing || existing.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterMs: 0 };
  }
  if (existing.count >= limit) {
    return { ok: false, retryAfterMs: Math.max(1000, existing.resetAt - now) };
  }
  existing.count += 1;
  return { ok: true, retryAfterMs: 0 };
};

const sendRateLimitError = (response, message, retryAfterMs = 0) => {
  sendJson(
    response,
    429,
    { error: message || "请求过于频繁，请稍后再试" },
    {
      noStore: true,
      headers: retryAfterMs ? { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } : {},
    },
  );
};

const enforceRateLimit = (response, key, limit, windowMs, message) => {
  const verdict = consumeRateLimit(key, limit, windowMs);
  if (verdict.ok) return true;
  sendRateLimitError(response, message, verdict.retryAfterMs);
  return false;
};

const canCountView = (workId, actorKey) => {
  if (!workId || !actorKey) return true;
  const now = Date.now();
  const key = `${workId}:${actorKey}`;
  const expiresAt = recentViews.get(key) || 0;
  if (expiresAt > now) return false;
  recentViews.set(key, now + viewDedupWindowMs);
  return true;
};

const getMutationOrigin = (request) => safeTrim(request.headers.origin || request.headers.referer);

const isTrustedOrigin = (request) => {
  const origin = getMutationOrigin(request);
  if (!origin) return isLocalDevRequest(request);
  try {
    return new URL(origin).origin === getPublicOrigin(request);
  } catch {
    return false;
  }
};

const ensureTrustedMutationOrigin = (request, response) => {
  if (!["POST", "PUT", "DELETE", "PATCH"].includes(request.method)) return true;
  if (isTrustedOrigin(request)) return true;
  sendJson(response, 403, { error: "请求来源不受信任，请刷新页面后重试" }, { noStore: true });
  return false;
};

const isDisposableEmail = (email) => disposableEmailDomains.has((normalizeEmail(email).split("@")[1] || "").toLowerCase());

const analyzeExternalUrl = (value, { kind = "primary", linkType = "website" } = {}) => {
  const raw = safeTrim(value);
  if (!raw) {
    return { ok: true, normalized: "", level: "normal", reasons: [], blockedReasons: [], hostname: "", domainKey: "" };
  }

  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    return {
      ok: false,
      normalized: raw,
      level: "blocked",
      reasons: [],
      blockedReasons: ["链接格式无效"],
      hostname: "",
      domainKey: "",
    };
  }

  const protocol = parsed.protocol.toLowerCase();
  const hostname = normalizeHostname(parsed.hostname);
  const domainKey = normalizeDomainKey(hostname);
  const reasons = [];
  const blockedReasons = [];
  const blockedProtocols = new Set(["javascript:", "data:", "file:", "vbscript:", "blob:", "about:"]);
  const pathname = safeTrim(parsed.pathname).toLowerCase();
  const extension = pathname.includes(".") ? pathname.split(".").pop() : "";
  const domainPolicy = getDomainPolicy(hostname);

  if (blockedProtocols.has(protocol)) blockedReasons.push("链接协议不安全");
  if (!["http:", "https:"].includes(protocol)) blockedReasons.push("仅支持 HTTP 或 HTTPS 链接");
  if (parsed.username || parsed.password) blockedReasons.push("链接中包含账号信息");
  if (isPrivateIpHost(hostname) || hostname === "localhost") blockedReasons.push("链接指向本地或内网地址");
  if (kind === "github" && hostname && !isGithubHost(hostname)) blockedReasons.push("不是 GitHub 官方域名");
  if (safeTrim(linkType).toLowerCase() === "appstore" && kind === "primary" && hostname && !isAppStoreHost(hostname)) {
    blockedReasons.push("导流方式为 App Store，但域名不是 App Store 官方地址");
  }
  if (kind === "primary" && hostname && contactOnlyHosts.has(hostname)) blockedReasons.push("主链接不能直接指向聊天或社群邀请地址");
  if (kind === "primary" && hostname && urlShortenerHosts.has(hostname)) blockedReasons.push("请填写作品最终落地页，不接受短链接");
  if (kind === "primary" && blockedPrimaryExtensions.has(extension)) blockedReasons.push("作品主链接不能指向安装包或压缩包");
  if (domainPolicy?.status === "blocked") blockedReasons.push(domainPolicy.reason || "该域名已被封禁");

  if (hostname.startsWith("xn--")) reasons.push("域名使用了转码字符");
  if (isIpHost(hostname)) reasons.push("链接使用了 IP 地址");
  if (protocol !== "https:") reasons.push("链接未启用 HTTPS");
  if (parsed.port && !["80", "443"].includes(parsed.port)) reasons.push("链接使用了非常见端口");
  if (hostname && riskyTlds.has(hostname.split(".").pop() || "")) reasons.push("域名后缀风险较高");
  if (safeTrim(linkType).toLowerCase() === "website" && hostname.endsWith(".app")) reasons.push("请确认该域名提供的是公开网页");
  if (domainPolicy?.status === "review") reasons.push(domainPolicy.reason || "该域名需人工复核");

  return {
    ok: blockedReasons.length === 0,
    normalized: parsed.toString(),
    level: blockedReasons.length ? "blocked" : reasons.length ? "caution" : "normal",
    reasons: dedupeTextList(reasons, 10, 120),
    blockedReasons: dedupeTextList(blockedReasons, 8, 120),
    hostname,
    domainKey,
  };
};

const collectRecentWorksByDomain = (domainKey, excludeWorkId = "") =>
  getSortedWorks().filter((work) => {
    if (work.id === excludeWorkId) return false;
    try {
      return normalizeDomainKey(new URL(work.url).hostname) === domainKey;
    } catch {
      return false;
    }
  });

const getReportsForWork = (workId) =>
  [...reports.values()]
    .filter((report) => report.workId === workId)
    .sort((a, b) => (Number(a.createdAt) || 0) - (Number(b.createdAt) || 0));

const countDistinctReportersForWork = (workId) =>
  new Set(
    getReportsForWork(workId)
      .map((report) => safeTrim(report.reportedBy))
      .filter(Boolean),
  ).size;

const buildReportSignalSummary = (workId) => {
  const reportsForWork = getReportsForWork(workId);
  const bucketsByIp = new Map();
  const reporterIds = new Set();
  const matureReporterIds = new Set();
  const trustedReporterIds = new Set();

  reportsForWork.forEach((report) => {
    const reporterId = safeTrim(report.reportedBy);
    const reporterIpHash = safeTrim(report.reporterIpHash);
    const account = reporterId ? accounts.get(reporterId) || null : null;
    const accountAgeMs = account ? Date.now() - (Number(account.createdAt) || Date.now()) : 0;
    const strikes = Number(account?.strikes) || 0;
    const blockedCount = Number(account?.blockedCount) || 0;
    const publishCount = Number(account?.publishCount) || 0;
    const loginCount = Number(account?.loginCount) || 0;
    let weight = 1;

    if (!account) weight -= 0.55;
    if (accountAgeMs < oneDayMs) weight -= 0.45;
    else if (accountAgeMs < 3 * oneDayMs) weight -= 0.2;
    if (loginCount < 2) weight -= 0.15;
    if (safeTrim(account?.provider) === "github") weight += 0.2;
    if (publishCount >= 1) weight += 0.15;
    if (strikes >= 1) weight -= 0.35;
    if (blockedCount >= 1) weight -= 0.35;
    weight = Math.max(0.1, Math.min(1.4, Number(weight.toFixed(2))));

    const mature = Boolean(account && accountAgeMs >= oneDayMs && loginCount >= 2 && strikes === 0);
    const trusted = Boolean(account && (accountAgeMs >= 3 * oneDayMs || safeTrim(account.provider) === "github" || publishCount >= 1) && strikes === 0);
    const ipKey = reporterIpHash || `user:${reporterId || report.id}`;
    const current = bucketsByIp.get(ipKey);
    const signal = {
      reportId: report.id,
      reporterId,
      reporterEmail: safeTrim(report.reporterEmail),
      reporterIpHash,
      weight,
      mature,
      trusted,
    };

    reporterIds.add(reporterId || report.id);
    if (mature) matureReporterIds.add(reporterId || report.id);
    if (trusted) trustedReporterIds.add(reporterId || report.id);
    if (!current || current.weight < signal.weight) bucketsByIp.set(ipKey, signal);
  });

  const weightedScore = [...bucketsByIp.values()].reduce((sum, item) => sum + item.weight, 0);
  return {
    totalReports: reportsForWork.length,
    distinctReporterCount: reporterIds.size,
    distinctIpCount: bucketsByIp.size,
    matureReporterCount: matureReporterIds.size,
    trustedReporterCount: trustedReporterIds.size,
    weightedScore: Number(weightedScore.toFixed(2)),
    strongestSignals: [...bucketsByIp.values()].sort((a, b) => b.weight - a.weight).slice(0, 8),
  };
};

const analyzeWorkRisk = ({ work, user, request, existing = null }) => {
  const account = readAccountState(user);
  const primaryAnalysis = analyzeExternalUrl(work.url, { kind: "primary", linkType: work.linkType });
  const githubAnalysis = analyzeExternalUrl(work.github, { kind: "github" });
  const text = [work.title, work.description, work.tool, work.stack, ...(work.releaseNotes || [])].join(" \n ");
  const reasons = [...primaryAnalysis.reasons, ...githubAnalysis.reasons];
  const blockedReasons = [...primaryAnalysis.blockedReasons, ...githubAnalysis.blockedReasons];
  let score = 0;

  suspiciousContentPatterns.forEach((rule) => {
    if (rule.pattern.test(text)) {
      score += rule.score;
      reasons.push(rule.reason);
    }
  });

  strongBlockedPatterns.forEach((pattern) => {
    if (pattern.test(text)) blockedReasons.push("文案命中高风险诈骗或违规关键词");
  });

  if (safeTrim(work.github) && !isGithubHost(normalizeHostname(new URL(work.github).hostname))) {
    blockedReasons.push("仓库链接必须指向 GitHub 官方域名");
  }

  const domainKey = primaryAnalysis.domainKey;
  if (domainKey) {
    let recentDomainWorks = [];
    try {
      recentDomainWorks = collectRecentWorksByDomain(domainKey, existing?.id || "");
    } catch {
      recentDomainWorks = [];
    }
    const recentByOtherAuthors = recentDomainWorks.filter((item) => item.authorId !== user.id && Date.now() - item.createdAt <= oneDayMs);
    if (recentByOtherAuthors.length >= 2) {
      score += 3;
      reasons.push("同一域名在短时间内被多个账号集中投递");
    }
  }

  if (account?.provider === "email") {
    score += 1;
    reasons.push("邮箱注册账号处于基础观察期");
  }
  if (account && Date.now() - account.createdAt < oneDayMs) {
    score += 1;
    reasons.push("账号注册时间较短");
  }
  if (account?.strikes >= 2) {
    score += 3;
    reasons.push("账号已有历史风险记录");
  }

  const ipHash = getIpHash(request);
  const burstAccountKey = `account-create:${ipHash}`;
  const burstBucket = rateBuckets.get(burstAccountKey);
  if (burstBucket?.count >= 3 && burstBucket.resetAt > Date.now()) {
    score += 2;
    reasons.push("当前网络环境近期创建了较多账号");
  }

  const dedupedBlocked = dedupeTextList(blockedReasons, 8, 120);
  const dedupedReasons = dedupeTextList(reasons, 12, 120);
  let moderationStatus = "published";
  if (dedupedBlocked.length || score >= 7) moderationStatus = "blocked";
  else if (score >= 3) moderationStatus = "pending_review";

  return {
    score,
    moderationStatus,
    moderationReasons: moderationStatus === "published" ? [] : dedupedBlocked.length ? dedupedBlocked : dedupedReasons,
    urlSafetyLevel: primaryAnalysis.level === "blocked" ? "caution" : primaryAnalysis.level,
    urlSafetyReasons: dedupeTextList([...primaryAnalysis.reasons, ...primaryAnalysis.blockedReasons], 10, 120),
    githubSafetyLevel: githubAnalysis.level === "blocked" ? "caution" : githubAnalysis.level,
    githubSafetyReasons: dedupeTextList([...githubAnalysis.reasons, ...githubAnalysis.blockedReasons], 10, 120),
  };
};

const isAdminUser = (user) => {
  if (!user?.email) return false;
  const allowlist = String(process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((item) => normalizeEmail(item))
    .filter(Boolean);
  return allowlist.includes(normalizeEmail(user.email));
};

const getVisibleWorksForViewer = (viewer = null) => {
  const viewerId = viewer?.id || "";
  const admin = isAdminUser(viewer);
  return getSortedWorks().filter((work) => {
    const status = safeTrim(work.moderationStatus || "published") || "published";
    if (status === "published") return true;
    if (admin) return true;
    return Boolean(viewerId && work.authorId === viewerId);
  });
};

const buildModerationSummary = (work) => {
  const status = safeTrim(work?.moderationStatus || "published") || "published";
  const reasons = dedupeTextList(work?.moderationReasons || [], 8, 120);
  return { status, reasons };
};

const applyModerationToWork = ({ work, user, request, existing = null }) => {
  const moderation = analyzeWorkRisk({ work, user, request, existing });
  return {
    ...work,
    moderationStatus: moderation.moderationStatus,
    moderationReasons: moderation.moderationReasons,
    riskScore: moderation.score,
    urlSafetyLevel: moderation.urlSafetyLevel,
    urlSafetyReasons: moderation.urlSafetyReasons,
    githubSafetyLevel: moderation.githubSafetyLevel,
    githubSafetyReasons: moderation.githubSafetyReasons,
  };
};

const updateAccountAfterPublish = (user, moderationStatus) => {
  const current = readAccountState(user);
  if (!current) return null;
  const patch = {
    publishCount: (Number(current.publishCount) || 0) + 1,
    pendingCount:
      moderationStatus === "pending_review"
        ? (Number(current.pendingCount) || 0) + 1
        : Number(current.pendingCount) || 0,
    blockedCount:
      moderationStatus === "blocked" ? (Number(current.blockedCount) || 0) + 1 : Number(current.blockedCount) || 0,
  };
  if (moderationStatus !== "published") patch.trustFlags = [...(current.trustFlags || []), moderationStatus];
  return persistAccountState(user, patch);
};

const quarantineWorkFromReports = (workId) => {
  const work = works.get(workId);
  if (!work) return { triggered: false, summary: null };
  if (safeTrim(work.moderationStatus) !== "published") return { triggered: false, summary: null };
  const summary = buildReportSignalSummary(workId);
  const shouldHold =
    summary.distinctReporterCount >= 3 &&
    summary.distinctIpCount >= 2 &&
    summary.weightedScore >= 2.2 &&
    (summary.matureReporterCount >= 2 || summary.trustedReporterCount >= 2);
  if (!shouldHold) return { triggered: false, summary };
  works.set(workId, {
    ...work,
    moderationStatus: "pending_review",
    moderationReasons: dedupeTextList(
      [
        ...(work.moderationReasons || []),
        `多位独立账号举报，已转入人工审核（${summary.distinctReporterCount} 人 / ${summary.distinctIpCount} 个网络环境）`,
      ],
      8,
      120,
    ),
  });
  persistWorks();
  return { triggered: true, summary };
};

const formatHandle = (handle, fallbackName = "creator") => {
  const raw = safeTrim(handle);
  if (raw.startsWith("@")) return raw.slice(0, 80);
  if (raw) return `@${raw.slice(0, 79)}`;
  const slug = slugify(fallbackName) || "creator";
  return `@${slug}`.slice(0, 80);
};

const pickVisual = (seed = "") => {
  const options = ["visual-one", "visual-two", "visual-three"];
  const source = safeTrim(seed) || String(Date.now());
  let hash = 0;
  for (const char of source) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return options[hash % options.length];
};

const getRequestUser = (request) => {
  const cookies = parseCookies(request);
  const headerTok = safeTrim(request.headers["x-viby-session"]);
  const raw = cookies.viby_session || cookies.viby_session_js || headerTok;
  let user = raw ? readUserFromVibySession(raw) : null;
  if (!user && raw) user = sessions.get(raw) || null;
  return user ? hydrateSessionUser(user) : null;
};

const getSortedWorks = () =>
  [...works.values()]
    .filter((item) => item && typeof item === "object" && safeTrim(item.id))
    .sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0));

const getDefaultProfile = (user) => {
  const displayName = safeTrim(user?.name || (user?.email || "").split("@")[0] || "创作者").slice(0, 80) || "创作者";
  const avatarUrl = safeTrim(user?.avatar);
  const signature = "分享我最近完成的作品，也记录每一次认真迭代。";
  return {
    displayName,
    avatarDataUrl: avatarUrl,
    signature,
    nameChanges: [],
    avatarChanges: [],
  };
};

const getProfileForUser = (user) => {
  if (!user?.id) return getDefaultProfile(user);
  const stored = profiles.get(user.id);
  const fallback = getDefaultProfile(user);
  return {
    ...fallback,
    ...(stored && typeof stored === "object" ? stored : {}),
    displayName: safeTrim(stored?.displayName || fallback.displayName).slice(0, 80) || fallback.displayName,
    avatarDataUrl: safeTrim(stored?.avatarDataUrl || fallback.avatarDataUrl),
    signature: safeTrim(stored?.signature || fallback.signature).slice(0, 160) || fallback.signature,
    nameChanges: dedupeTextList(stored?.nameChanges || [], 10, 32).map((item) => Number(item) || 0).filter(Boolean),
    avatarChanges: dedupeTextList(stored?.avatarChanges || [], 20, 32).map((item) => Number(item) || 0).filter(Boolean),
  };
};

const buildAuthorSnapshot = (user) => {
  const profile = getProfileForUser(user);
  return {
    authorId: user.id,
    authorName: profile.displayName,
    authorAvatar: profile.avatarDataUrl,
    authorHandle: formatHandle((user.email || profile.displayName).split("@")[0], profile.displayName),
    authorBio: profile.signature,
  };
};

const serializeWorkForViewer = (work, viewer = null) => {
  if (!work || typeof work !== "object") return null;
  const viewerId = viewer?.id || "";
  const admin = isAdminUser(viewer);
  const {
    likedBy,
    baseLikes: _baseLikes,
    riskScore: _riskScore,
    threatIntelSources: _threatIntelSources,
    threatIntelStatus: _threatIntelStatus,
    threatIntelCheckedAt: _threatIntelCheckedAt,
    ...rest
  } = work;
  const likedIds = Array.isArray(likedBy) ? likedBy : [];
  const summary = buildModerationSummary(work);
  return {
    ...rest,
    likes: Math.max(0, Number(work.baseLikes) || 0) + likedIds.length,
    viewerHasLiked: Boolean(viewerId && likedIds.includes(viewerId)),
    moderationStatus: summary.status,
    moderationReasons: admin || (viewerId && work.authorId === viewerId) ? summary.reasons : [],
  };
};

const normalizeWorkPayload = (payload = {}, user, existing = null) => {
  const source = existing ? { ...existing, ...payload } : payload;
  if (safeTrim(source.contactPage)) return { error: "请求未通过校验，请刷新页面后重试" };
  if (!parseBooleanish(source.publisherAgreement)) {
    return { error: "请先确认你有权发布这些内容，并同意 Viby 的安全与合规要求" };
  }
  const requestedId = safeTrim(existing?.id || payload.id || `work-${Date.now()}`);
  const category = safeTrim(source.category).toLowerCase() === "app" ? "app" : "website";
  const linkType = safeTrim(source.linkType).toLowerCase() === "appstore" ? "appstore" : "website";
  const photoAssets = sanitizeImageList(Array.isArray(source.photos) ? source.photos : [], {
    label: "作品截图",
    maxItems: 5,
    maxDataUrlBytes: 4 * 1024 * 1024,
  });
  if (!photoAssets.ok) return { error: photoAssets.error };
  const coverAsset = sanitizeImageAsset(source.cover || photoAssets.items[0], {
    label: "作品封面",
    maxDataUrlBytes: 4 * 1024 * 1024,
  });
  if (!coverAsset.ok) return { error: coverAsset.error };
  const photos = dedupePhotos([...photoAssets.items, ...(coverAsset.value ? [coverAsset.value] : [])], 5);
  const cover = safeTrim(coverAsset.value || photos[0]);
  const releaseNotes = dedupeTextList(source.releaseNotes, 24, 200);
  const devices = dedupeTextList(source.devices, 5, 24);
  const title = safeTrim(source.title).slice(0, 80);
  const description = safeTrim(source.description).slice(0, 240);
  const url = safeTrim(source.url);
  const github = safeTrim(source.github);
  const author = buildAuthorSnapshot(user);
  const likedBy = dedupeTextList(existing?.likedBy || source.likedBy, 500, 120);
  const baseLikes = Math.max(
    0,
    Number.isFinite(Number(existing?.baseLikes))
      ? Number(existing?.baseLikes)
      : Number.isFinite(Number(source.baseLikes))
        ? Number(source.baseLikes)
        : Number(source.likes) || 0,
  );
  const createdAt = existing?.createdAt || Number(source.createdAt) || Date.now();
  const views = Math.max(0, Number(existing?.views || source.views) || 0);

  if (!title) return { error: "请填写作品名称" };
  if (!description) return { error: "请填写一句话简介" };
  if (!url) return { error: "请填写访问链接" };
  if (!cover) return { error: "请至少上传 1 张作品截图" };

  const primaryAnalysis = analyzeExternalUrl(url, { kind: "primary", linkType });
  if (!primaryAnalysis.ok) {
    return { error: primaryAnalysis.blockedReasons[0] || "作品链接存在安全风险，无法发布" };
  }

  const githubAnalysis = github ? analyzeExternalUrl(github, { kind: "github" }) : null;
  if (githubAnalysis && !githubAnalysis.ok) {
    return { error: githubAnalysis.blockedReasons[0] || "GitHub 链接存在安全风险，无法发布" };
  }

  return {
    id: requestedId,
    title,
    description,
    url: primaryAnalysis.normalized,
    urlSafetyLevel: primaryAnalysis.level === "blocked" ? "caution" : primaryAnalysis.level,
    urlSafetyReasons: dedupeTextList([...primaryAnalysis.reasons, ...primaryAnalysis.blockedReasons], 8, 120),
    github: githubAnalysis?.normalized || github,
    githubSafetyLevel: githubAnalysis?.level === "blocked" ? "caution" : githubAnalysis?.level || "normal",
    githubSafetyReasons: dedupeTextList(
      [...(githubAnalysis?.reasons || []), ...(githubAnalysis?.blockedReasons || [])],
      8,
      120,
    ),
    category,
    type: safeTrim(source.type) || (category === "app" ? "App" : "Website"),
    linkType,
    tool: safeTrim(source.tool).slice(0, 80),
    stack: safeTrim(source.stack).slice(0, 120),
    versionTag: safeTrim(source.versionTag).slice(0, 32),
    releaseNotes,
    devices: devices.length ? devices : ["电脑端"],
    cover,
    photos: photos.length ? photos : [cover],
    isUserCreated: true,
    ...author,
    createdAt,
    views,
    baseLikes,
    likedBy,
    likes: baseLikes + likedBy.length,
    visual: safeTrim(existing?.visual || source.visual) || pickVisual(requestedId),
    moderationStatus: safeTrim(existing?.moderationStatus || source.moderationStatus || "published") || "published",
    moderationReasons: dedupeTextList(existing?.moderationReasons || source.moderationReasons, 8, 120),
    riskScore: Math.max(0, Number(existing?.riskScore || source.riskScore) || 0),
  };
};

const syncAuthorSnapshot = (userId, authorPatch = {}) => {
  let changed = false;
  const authorName = safeTrim(authorPatch.authorName).slice(0, 80);
  const authorAvatar = safeTrim(authorPatch.authorAvatar);
  const authorHandle = safeTrim(authorPatch.authorHandle);
  const authorBio = safeTrim(authorPatch.authorBio).slice(0, 160);

  getSortedWorks().forEach((work) => {
    if (work.authorId !== userId) return;
    const next = {
      ...work,
      authorName: authorName || work.authorName,
      authorAvatar: authorAvatar || work.authorAvatar,
      authorHandle: authorHandle ? formatHandle(authorHandle, authorName || work.authorName) : work.authorHandle,
      authorBio: authorBio || work.authorBio,
    };
    if (
      next.authorName !== work.authorName ||
      next.authorAvatar !== work.authorAvatar ||
      next.authorHandle !== work.authorHandle ||
      next.authorBio !== work.authorBio
    ) {
      works.set(work.id, next);
      changed = true;
    }
  });

  if (changed) persistWorks();
  return changed;
};

const normalizeProfilePatch = (payload = {}, user) => {
  const current = getProfileForUser(user);
  const nextDisplayName = safeTrim(payload.displayName || current.displayName).slice(0, 80) || current.displayName;
  if (!isAdminUser(user) && reservedProfileTerms.some((pattern) => pattern.test(nextDisplayName))) {
    return { error: "展示名称疑似冒充官方或客服，请换一个名称" };
  }
  const avatarAsset = sanitizeImageAsset(payload.avatarDataUrl || current.avatarDataUrl, {
    label: "头像",
    maxDataUrlBytes: 1200 * 1024,
  });
  if (!avatarAsset.ok) return { error: avatarAsset.error };
  return {
    displayName: nextDisplayName,
    avatarDataUrl: avatarAsset.value,
    signature: safeTrim(payload.signature || current.signature).slice(0, 160) || current.signature,
    nameChanges: (Array.isArray(payload.nameChanges) ? payload.nameChanges : current.nameChanges)
      .map((item) => Number(item) || 0)
      .filter(Boolean)
      .slice(-10),
    avatarChanges: (Array.isArray(payload.avatarChanges) ? payload.avatarChanges : current.avatarChanges)
      .map((item) => Number(item) || 0)
      .filter(Boolean)
      .slice(-20),
  };
};

const auditLog = (event, payload = {}) => {
  try {
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });
    const line = JSON.stringify({
      at: new Date().toISOString(),
      event,
      ...payload,
    });
    fs.appendFileSync(auditLogFile, `${line}\n`, "utf8");
  } catch (error) {
    console.warn("[viby] audit log failed:", error.message);
  }
};

const applySecurityHeaders = (headers = {}) => ({ ...securityHeaders, ...headers });

const sendJson = (response, status, body, options = {}) => {
  const headers = { "Content-Type": "application/json; charset=utf-8", ...(options.headers || {}) };
  if (options.noStore) headers["Cache-Control"] = "no-store, must-revalidate";
  response.writeHead(status, applySecurityHeaders(headers));
  response.end(JSON.stringify(body));
};

const redirect = (response, location, headers = {}) => {
  response.writeHead(302, applySecurityHeaders({ Location: location, ...headers }));
  response.end();
};

const readRequestBody = (request, { limitBytes = 9 * 1024 * 1024 } = {}) =>
  new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body, "utf8") > limitBytes) {
        const error = new Error("payload_too_large");
        error.code = "PAYLOAD_TOO_LARGE";
        reject(error);
        request.destroy();
      }
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

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));

const maskEmail = (value) => {
  const email = normalizeEmail(value);
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return email;
  if (localPart.length <= 2) return `${localPart[0] || "*"}*@${domain}`;
  return `${localPart.slice(0, 2)}***${localPart.slice(-1)}@${domain}`;
};

const emailLoginReady = () =>
  Boolean(process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim());

const isLocalDevRequest = (request) => {
  const host = requestHostname(request);
  return !process.env.PUBLIC_ORIGIN?.trim() || host === "localhost" || host === "127.0.0.1";
};

const createEmailLoginUser = (email) => {
  const normalized = normalizeEmail(email);
  const localPart = normalized.split("@")[0] || "creator";
  const digest = crypto.createHash("sha1").update(normalized).digest("hex").slice(0, 16);
  const label = localPart.slice(0, 2).toUpperCase() || "V";
  const avatar = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#5f3dff" />
          <stop offset="100%" stop-color="#7edfff" />
        </linearGradient>
      </defs>
      <rect width="160" height="160" rx="44" fill="url(#g)" />
      <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial, PingFang SC, Microsoft YaHei, sans-serif"
        font-size="54" font-weight="700" fill="white">${label}</text>
    </svg>
  `)}`;

  return {
    id: `email-${digest}`,
    email: normalized,
    name: localPart,
    avatar,
    provider: "email",
  };
};

const sendEmailOtp = async (to, code) => {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (!apiKey || !from) throw new Error("email_provider_not_configured");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: from.includes("<") ? from : `Viby <${from}>`,
      to,
      reply_to: from.includes("<") ? from.replace(/^.*<([^>]+)>.*$/, "$1") : from,
      subject: "你的 Viby 登录验证码",
      text: `你的 Viby 登录验证码是 ${code}。验证码 10 分钟内有效。`,
      html: `<div style="font-family:Arial,PingFang SC,Microsoft YaHei,sans-serif;padding:24px">
        <h2 style="margin:0 0 12px;color:#12121d">登录 Viby</h2>
        <p style="margin:0 0 16px;color:#565260">你的验证码如下，10 分钟内有效。</p>
        <div style="display:inline-block;padding:12px 18px;border-radius:14px;background:#f5f2ff;color:#5f3dff;font-size:28px;font-weight:700;letter-spacing:0.18em">${code}</div>
      </div>`,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`email_send_failed:${response.status}:${body}`);
  }

  const payload = await response.json().catch(() => ({}));
  return payload;
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
  if (!enforceRateLimit(response, `auth:github:start:${getIpHash(request)}`, 20, oneHourMs, "登录请求过于频繁，请稍后再试")) return;
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
  if (!enforceRateLimit(response, `auth:github:callback:${getIpHash(request)}`, 24, oneHourMs, "登录请求过于频繁，请稍后再试")) return;
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
    registerLogin(user, request);
    consumeRateLimit(`account-create:${getIpHash(request)}`, 9999, oneDayMs);
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
  const user = getRequestUser(request);
  if (user) readAccountState(user);
  sendJson(response, user ? 200 : 401, user ? { user, profile: getProfileForUser(user) } : { user: null }, { noStore: true });
};

const handleHealth = (response) => {
  sendJson(
    response,
    200,
    {
      ok: true,
      githubOAuthReady: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
      emailLoginReady: emailLoginReady(),
      threatIntelProviders: getThreatIntelProviderSummary(),
    },
    { noStore: true },
  );
};

const normalizeSharePayload = (payload = {}) => {
  const kind = payload.kind === "profile" ? "profile" : "work";
  const template = ["aurora", "paper", "noir"].includes(payload.template) ? payload.template : "aurora";
  const authorAvatar = sanitizeImageAsset(payload.author?.avatar, { label: "分享头像", maxDataUrlBytes: 1200 * 1024 });
  if (!authorAvatar.ok) return { error: authorAvatar.error };

  if (kind === "profile") {
    const worksPreview = Array.isArray(payload.worksPreview)
      ? payload.worksPreview.slice(0, 3).map((item) => {
          const cover = sanitizeImageAsset(item?.cover, { label: "分享预览图", maxDataUrlBytes: 4 * 1024 * 1024 });
          return {
            title: String(item?.title || "").slice(0, 80),
            cover: cover.ok ? cover.value : "",
            category: String(item?.category || "").slice(0, 24),
          };
        })
      : [];
    return {
      kind,
      template,
      title: String(payload.title || "").slice(0, 80),
      description: String(payload.description || "").slice(0, 240),
      author: {
        name: String(payload.author?.name || "").slice(0, 80),
        handle: String(payload.author?.handle || "").slice(0, 80),
        avatar: authorAvatar.value,
      },
      stats: {
        works: Number(payload.stats?.works) || 0,
        views: Number(payload.stats?.views) || 0,
        likes: Number(payload.stats?.likes) || 0,
      },
      worksPreview,
      libraryUrl: String(payload.libraryUrl || ""),
      legalNotice: String(payload.legalNotice || "").slice(0, 240),
      platformUrl: String(payload.platformUrl || "").slice(0, 160),
    };
  }

  const shareCover = sanitizeImageAsset(payload.cover, { label: "分享封面", maxDataUrlBytes: 4 * 1024 * 1024 });
  if (!shareCover.ok) return { error: shareCover.error };

  return {
    kind,
    template,
    title: String(payload.title || "").slice(0, 80),
    description: String(payload.description || "").slice(0, 240),
    category: String(payload.category || "").slice(0, 24),
    cover: shareCover.value,
    sourceWorkId: String(payload.sourceWorkId || "").slice(0, 120),
    stats: {
      views: Number(payload.stats?.views) || 0,
      likes: Number(payload.stats?.likes) || 0,
    },
    meta: Array.isArray(payload.meta) ? payload.meta.slice(0, 4).map((item) => String(item || "").slice(0, 40)) : [],
    versionTag: String(payload.versionTag || "").slice(0, 32),
    author: {
      name: String(payload.author?.name || "").slice(0, 80),
      handle: String(payload.author?.handle || "").slice(0, 80),
      avatar: authorAvatar.value,
    },
    primaryUrl: String(payload.primaryUrl || ""),
    primaryLabel: String(payload.primaryLabel || "").slice(0, 40),
    github: String(payload.github || ""),
    urlSafetyLevel: safeTrim(payload.urlSafetyLevel || "normal") === "caution" ? "caution" : "normal",
    urlSafetyReasons: dedupeTextList(payload.urlSafetyReasons, 8, 120),
    githubSafetyLevel: safeTrim(payload.githubSafetyLevel || "normal") === "caution" ? "caution" : "normal",
    githubSafetyReasons: dedupeTextList(payload.githubSafetyReasons, 8, 120),
    legalNotice: String(payload.legalNotice || "").slice(0, 240),
    platformUrl: String(payload.platformUrl || "").slice(0, 160),
    createdAt: Number(payload.createdAt) || Date.now(),
  };
};

const handleCreateShare = async (request, response) => {
  const user = getRequestUser(request);
  if (!user) {
    sendJson(response, 401, { error: "请先登录后再生成分享页" }, { noStore: true });
    return;
  }
  if (!enforceRateLimit(response, `share:create:user:${user.id}`, 24, oneHourMs, "生成分享页过于频繁，请稍后再试")) return;

  let payload = {};
  try {
    payload = JSON.parse((await readRequestBody(request)) || "{}");
  } catch {
    sendJson(response, 400, { error: "请求格式不正确" }, { noStore: true });
    return;
  }

  const normalized = normalizeSharePayload(payload);
  if (normalized.error) {
    sendJson(response, 400, { error: normalized.error }, { noStore: true });
    return;
  }
  if (!normalized.title) {
    sendJson(response, 400, { error: "缺少分享标题" }, { noStore: true });
    return;
  }
  if (normalized.kind === "work") {
    const primary = analyzeExternalUrl(normalized.primaryUrl, { kind: "primary", linkType: "website" });
    if (!primary.ok) {
      sendJson(response, 400, { error: primary.blockedReasons[0] || "分享链接存在安全风险" }, { noStore: true });
      return;
    }
    const primaryIntel = await lookupThreatIntel(primary.normalized);
    if (primaryIntel.status === "malicious") {
      sendJson(response, 400, { error: primaryIntel.reasons[0] || "分享链接被安全情报源标记为高风险" }, { noStore: true });
      return;
    }
    if (normalized.github) {
      const github = analyzeExternalUrl(normalized.github, { kind: "github" });
      if (!github.ok) {
        sendJson(response, 400, { error: github.blockedReasons[0] || "GitHub 链接存在安全风险" }, { noStore: true });
        return;
      }
      const githubIntel = await lookupThreatIntel(github.normalized);
      if (githubIntel.status === "malicious") {
        sendJson(response, 400, { error: githubIntel.reasons[0] || "GitHub 链接被安全情报源标记为高风险" }, { noStore: true });
        return;
      }
      normalized.githubSafetyLevel = github.level === "blocked" ? "caution" : github.level;
      normalized.githubSafetyReasons = dedupeTextList(
        [...github.reasons, ...github.blockedReasons, ...githubIntel.reasons],
        8,
        120,
      );
    }
    normalized.urlSafetyLevel = primary.level === "blocked" ? "caution" : primary.level;
    normalized.urlSafetyReasons = dedupeTextList(
      [...primary.reasons, ...primary.blockedReasons, ...primaryIntel.reasons],
      8,
      120,
    );
    normalized.legalNotice =
      "Viby 仅提供第三方作品展示入口，不对外部站点的合法性、安全性、真实性或交易结果作保证。请勿输入密码、验证码、银行卡、助记词或私钥。";
  }
  if (normalized.kind === "profile" && normalized.libraryUrl) {
    const libraryUrl = analyzeExternalUrl(normalized.libraryUrl, { kind: "primary", linkType: "website" });
    if (!libraryUrl.ok) {
      sendJson(response, 400, { error: libraryUrl.blockedReasons[0] || "主页分享链接存在安全风险" }, { noStore: true });
      return;
    }
    normalized.legalNotice =
      "Viby 展示页仅用于作品发现与创作者介绍；访问第三方站点前请自行判断其安全性与合法性，不要提交敏感凭据或付款信息。";
  }

  const bodySize = Buffer.byteLength(JSON.stringify(normalized), "utf8");
  if (bodySize > 8 * 1024 * 1024) {
    sendJson(response, 413, { error: "分享内容过大，请减少截图后重试" }, { noStore: true });
    return;
  }

  const id = crypto.randomBytes(9).toString("base64url");
  shares.set(id, {
    ...normalized,
    id,
    createdBy: user.id,
    createdAt: Date.now(),
  });
  persistShares();
  sendJson(response, 200, { ok: true, id, url: `/share.html?id=${encodeURIComponent(id)}` }, { noStore: true });
};

const handleGetShare = (response, id) => {
  const record = shares.get(id);
  if (!record) {
    sendJson(response, 404, { error: "未找到这条分享记录" }, { noStore: true });
    return;
  }
  if (record.kind === "work" && safeTrim(record.sourceWorkId)) {
    const sourceWork = works.get(record.sourceWorkId);
    if (!sourceWork || safeTrim(sourceWork.moderationStatus || "published") !== "published") {
      sendJson(response, 410, { error: "这条分享页暂时不可用" }, { noStore: true });
      return;
    }
  }
  sendJson(response, 200, { share: record }, { noStore: true });
};

const handleCheckUrlSafety = async (request, response) => {
  if (!enforceRateLimit(response, `safety:check:ip:${getIpHash(request)}`, 80, oneHourMs, "安全检测过于频繁，请稍后再试")) return;
  let payload = {};
  try {
    payload = JSON.parse((await readRequestBody(request)) || "{}");
  } catch {
    sendJson(response, 400, { error: "请求格式不正确" }, { noStore: true });
    return;
  }

  const url = safeTrim(payload.url);
  const kind = safeTrim(payload.kind || "primary");
  const linkType = safeTrim(payload.linkType || "website");
  if (!url) {
    sendJson(response, 400, { error: "缺少要检测的链接" }, { noStore: true });
    return;
  }

  const local = analyzeExternalUrl(url, { kind, linkType });
  if (!local.ok) {
    sendJson(
      response,
      200,
      {
        status: "blocked",
        reasons: dedupeTextList([...local.blockedReasons, ...local.reasons], 10, 120),
        providers: [],
        hostname: local.hostname,
        normalized: local.normalized,
      },
      { noStore: true },
    );
    return;
  }

  const intel = await lookupThreatIntel(local.normalized);
  const reasons = dedupeTextList(
    [...local.reasons, ...(intel.status === "malicious" ? intel.reasons : [])],
    10,
    120,
  );
  const status = intel.status === "malicious" ? "malicious" : local.level === "caution" ? "caution" : intel.status;
  sendJson(
    response,
    200,
    {
      status,
      reasons,
      providers: intel.sources,
      checks: intel.checks,
      hostname: local.hostname,
      normalized: local.normalized,
      configuredProviders: getThreatIntelProviderSummary(),
    },
    { noStore: true },
  );
};

const handleGetProfile = (request, response) => {
  const user = getRequestUser(request);
  if (!user) {
    sendJson(response, 401, { error: "请先登录" }, { noStore: true });
    return;
  }
  sendJson(response, 200, { profile: getProfileForUser(user) }, { noStore: true });
};

const handleUpdateProfile = async (request, response) => {
  const user = getRequestUser(request);
  if (!user) {
    sendJson(response, 401, { error: "请先登录" }, { noStore: true });
    return;
  }
  if (!enforceRateLimit(response, `profile:update:user:${user.id}`, 20, oneHourMs, "资料修改过于频繁，请稍后再试")) return;

  let payload = {};
  try {
    payload = JSON.parse((await readRequestBody(request)) || "{}");
  } catch {
    sendJson(response, 400, { error: "请求格式不正确" }, { noStore: true });
    return;
  }

  const profile = normalizeProfilePatch(payload, user);
  if (profile.error) {
    sendJson(response, 400, { error: profile.error }, { noStore: true });
    return;
  }
  profiles.set(user.id, profile);
  persistProfiles();
  syncAuthorSnapshot(user.id, buildAuthorSnapshot(user));
  auditLog("profile.update", { userId: user.id });
  sendJson(response, 200, { ok: true, profile }, { noStore: true });
};

const handleListWorks = (request, response) => {
  const viewer = getRequestUser(request);
  sendJson(
    response,
    200,
    { works: getVisibleWorksForViewer(viewer).map((work) => serializeWorkForViewer(work, viewer)) },
    { noStore: true },
  );
};

const handleGetWork = (request, response, id) => {
  const work = works.get(id);
  if (!work) {
    sendJson(response, 404, { error: "未找到这件作品" }, { noStore: true });
    return;
  }
  const viewer = getRequestUser(request);
  const status = safeTrim(work.moderationStatus || "published") || "published";
  if (status !== "published" && !isAdminUser(viewer) && viewer?.id !== work.authorId) {
    sendJson(response, 404, { error: "未找到这件作品" }, { noStore: true });
    return;
  }
  sendJson(response, 200, { work: serializeWorkForViewer(work, viewer) }, { noStore: true });
};

const handleCreateWork = async (request, response) => {
  const user = getRequestUser(request);
  if (!user) {
    sendJson(response, 401, { error: "请先登录" }, { noStore: true });
    return;
  }

  if (!enforceRateLimit(response, `work:create:ip:${getIpHash(request)}`, 10, oneHourMs, "发布过于频繁，请稍后再试")) return;
  if (!enforceRateLimit(response, `work:create:user:${user.id}`, 6, oneHourMs, "你发布得有点太快了，请稍后再试")) return;

  let payload = {};
  try {
    payload = JSON.parse((await readRequestBody(request)) || "{}");
  } catch {
    sendJson(response, 400, { error: "请求格式不正确" }, { noStore: true });
    return;
  }

  const normalized = normalizeWorkPayload(payload, user, null);
  if (normalized.error) {
    sendJson(response, 400, { error: normalized.error }, { noStore: true });
    return;
  }

  const existing = works.get(normalized.id);
  if (existing && existing.authorId !== user.id) {
    sendJson(response, 409, { error: "该作品标识已存在" }, { noStore: true });
    return;
  }

  const work = applyModerationToWork({
    work: existing ? normalizeWorkPayload(payload, user, existing) : normalized,
    user,
    request,
    existing,
  });
  const primaryIntel = await lookupThreatIntel(work.url);
  let screenedWork = mergeThreatIntelIntoWork(work, primaryIntel, "url");
  if (screenedWork.github) {
    const githubIntel = await lookupThreatIntel(screenedWork.github);
    screenedWork = mergeThreatIntelIntoWork(screenedWork, githubIntel, "github");
  }
  works.set(screenedWork.id, screenedWork);
  persistWorks();
  updateAccountAfterPublish(user, screenedWork.moderationStatus);
  auditLog(existing ? "work.update" : "work.create", {
    userId: user.id,
    workId: screenedWork.id,
    threatIntelStatus: safeTrim(screenedWork.threatIntelStatus || ""),
  });
  sendJson(
    response,
    existing ? 200 : 201,
    { ok: true, work: serializeWorkForViewer(screenedWork, user) },
    { noStore: true },
  );
};

const handleUpdateWork = async (request, response, id) => {
  const user = getRequestUser(request);
  if (!user) {
    sendJson(response, 401, { error: "请先登录" }, { noStore: true });
    return;
  }

  if (!enforceRateLimit(response, `work:update:ip:${getIpHash(request)}`, 20, oneHourMs, "修改过于频繁，请稍后再试")) return;
  if (!enforceRateLimit(response, `work:update:user:${user.id}`, 16, oneHourMs, "修改过于频繁，请稍后再试")) return;

  const existing = works.get(id);
  if (!existing) {
    sendJson(response, 404, { error: "未找到这件作品" }, { noStore: true });
    return;
  }

  if (existing.authorId !== user.id) {
    sendJson(response, 403, { error: "只能修改你自己发布的作品" }, { noStore: true });
    return;
  }

  let payload = {};
  try {
    payload = JSON.parse((await readRequestBody(request)) || "{}");
  } catch {
    sendJson(response, 400, { error: "请求格式不正确" }, { noStore: true });
    return;
  }

  const work = normalizeWorkPayload(payload, user, existing);
  if (work.error) {
    sendJson(response, 400, { error: work.error }, { noStore: true });
    return;
  }

  const moderated = applyModerationToWork({ work: { ...work, id }, user, request, existing });
  const primaryIntel = await lookupThreatIntel(moderated.url);
  let screenedWork = mergeThreatIntelIntoWork(moderated, primaryIntel, "url");
  if (screenedWork.github) {
    const githubIntel = await lookupThreatIntel(screenedWork.github);
    screenedWork = mergeThreatIntelIntoWork(screenedWork, githubIntel, "github");
  }
  works.set(id, screenedWork);
  persistWorks();
  auditLog("work.update", { userId: user.id, workId: id, threatIntelStatus: safeTrim(screenedWork.threatIntelStatus || "") });
  sendJson(response, 200, { ok: true, work: serializeWorkForViewer(works.get(id), user) }, { noStore: true });
};

const handleDeleteWork = (request, response, id) => {
  const user = getRequestUser(request);
  if (!user) {
    sendJson(response, 401, { error: "请先登录" }, { noStore: true });
    return;
  }

  if (!enforceRateLimit(response, `work:delete:user:${user.id}`, 12, oneHourMs, "删除操作过于频繁，请稍后再试")) return;

  const existing = works.get(id);
  if (!existing) {
    sendJson(response, 404, { error: "未找到这件作品" }, { noStore: true });
    return;
  }

  if (existing.authorId !== user.id) {
    sendJson(response, 403, { error: "只能删除你自己发布的作品" }, { noStore: true });
    return;
  }

  works.delete(id);
  persistWorks();
  auditLog("work.delete", { userId: user.id, workId: id });
  sendJson(response, 200, { ok: true }, { noStore: true });
};

const handleSyncAuthorSnapshot = async (request, response) => {
  const user = getRequestUser(request);
  if (!user) {
    sendJson(response, 401, { error: "请先登录" }, { noStore: true });
    return;
  }
  if (!enforceRateLimit(response, `author:sync:user:${user.id}`, 20, oneHourMs, "同步操作过于频繁，请稍后再试")) return;

  let payload = {};
  try {
    payload = JSON.parse((await readRequestBody(request)) || "{}");
  } catch {
    sendJson(response, 400, { error: "请求格式不正确" }, { noStore: true });
    return;
  }

  syncAuthorSnapshot(user.id, payload);
  sendJson(response, 200, { ok: true }, { noStore: true });
};

const handleLikeWork = (request, response, id) => {
  const user = getRequestUser(request);
  if (!user) {
    sendJson(response, 401, { error: "登录后才能点赞" }, { noStore: true });
    return;
  }

  const work = works.get(id);
  if (!work) {
    sendJson(response, 404, { error: "未找到这件作品" }, { noStore: true });
    return;
  }
  if (!enforceRateLimit(response, `work:like:user:${user.id}`, 80, oneHourMs, "点赞过于频繁，请稍后再试")) return;
  if (safeTrim(work.moderationStatus || "published") !== "published" && !isAdminUser(user) && work.authorId !== user.id) {
    sendJson(response, 404, { error: "未找到这件作品" }, { noStore: true });
    return;
  }
  if (work.authorId === user.id) {
    sendJson(response, 403, { error: "不能给自己发布的作品点赞" }, { noStore: true });
    return;
  }

  const likedBy = Array.isArray(work.likedBy) ? [...work.likedBy] : [];
  if (likedBy.includes(user.id)) {
    sendJson(
      response,
      409,
      { error: "你已经给这个作品点过赞了", work: serializeWorkForViewer(work, user) },
      { noStore: true },
    );
    return;
  }

  likedBy.push(user.id);
  const next = {
    ...work,
    likedBy,
    likes: Math.max(0, Number(work.baseLikes) || 0) + likedBy.length,
  };
  works.set(id, next);
  persistWorks();
  auditLog("work.like", { userId: user.id, workId: id });
  sendJson(response, 200, { ok: true, work: serializeWorkForViewer(next, user) }, { noStore: true });
};

const handleTrackView = (request, response, id) => {
  const work = works.get(id);
  if (!work) {
    sendJson(response, 404, { error: "未找到这件作品" }, { noStore: true });
    return;
  }
  if (safeTrim(work.moderationStatus || "published") !== "published") {
    const viewer = getRequestUser(request);
    if (!isAdminUser(viewer) && viewer?.id !== work.authorId) {
      sendJson(response, 404, { error: "未找到这件作品" }, { noStore: true });
      return;
    }
  }

  const viewer = getRequestUser(request);
  if (viewer?.id && viewer.id === work.authorId) {
    sendJson(response, 200, { ok: true, work: serializeWorkForViewer(work, viewer) }, { noStore: true });
    return;
  }
  const actorKey = viewer?.id || getIpHash(request);
  if (!enforceRateLimit(response, `work:view:${getIpHash(request)}`, 300, oneHourMs, "访问过于频繁，请稍后再试")) return;
  if (!canCountView(id, actorKey)) {
    sendJson(response, 200, { ok: true, work: serializeWorkForViewer(work, viewer) }, { noStore: true });
    return;
  }

  const next = {
    ...work,
    views: Math.max(0, Number(work.views) || 0) + 1,
  };
  works.set(id, next);
  persistWorks();
  auditLog("work.view", { workId: id });
  sendJson(response, 200, { ok: true, work: serializeWorkForViewer(next, viewer) }, { noStore: true });
};

const handleReportWork = async (request, response, id) => {
  const user = getRequestUser(request);
  if (!user) {
    sendJson(response, 401, { error: "请先登录后再举报" }, { noStore: true });
    return;
  }

  if (!enforceRateLimit(response, `work:report:user:${user.id}`, 12, oneHourMs, "举报提交过于频繁，请稍后再试")) return;
  if (!enforceRateLimit(response, `work:report:ip:${getIpHash(request)}`, 24, oneHourMs, "当前网络环境举报过于频繁，请稍后再试")) return;

  const work = works.get(id);
  if (!work) {
    sendJson(response, 404, { error: "未找到这件作品" }, { noStore: true });
    return;
  }
  if (work.authorId === user.id) {
    sendJson(response, 400, { error: "不能举报自己发布的作品" }, { noStore: true });
    return;
  }
  if (getReportsForWork(id).some((report) => safeTrim(report.reportedBy) === user.id)) {
    sendJson(response, 409, { error: "你已经举报过这件作品，我们会继续跟进" }, { noStore: true });
    return;
  }

  let payload = {};
  try {
    payload = JSON.parse((await readRequestBody(request)) || "{}");
  } catch {
    sendJson(response, 400, { error: "请求格式不正确" }, { noStore: true });
    return;
  }

  const reason = safeTrim(payload.reason).slice(0, 80);
  const message = safeTrim(payload.message).slice(0, 500);
  if (!reason) {
    sendJson(response, 400, { error: "请填写举报原因" }, { noStore: true });
    return;
  }

  const reportId = crypto.randomBytes(9).toString("base64url");
  const reporterAccount = readAccountState(user);
  const report = {
    id: reportId,
    workId: id,
    workTitle: work.title,
    reportedBy: user.id,
    reporterEmail: user.email,
    reporterIpHash: getIpHash(request),
    reporterProvider: safeTrim(reporterAccount?.provider || user.provider),
    reporterAccountAgeMs: Math.max(0, Date.now() - (Number(reporterAccount?.createdAt) || Date.now())),
    reason,
    message,
    createdAt: Date.now(),
  };
  reports.set(reportId, report);
  persistReports();
  const holdResult = quarantineWorkFromReports(id);
  if (holdResult.triggered) {
    auditLog("work.auto_hold", {
      workId: id,
      reason: "reports_threshold",
      distinctReporterCount: holdResult.summary?.distinctReporterCount || 0,
      distinctIpCount: holdResult.summary?.distinctIpCount || 0,
      weightedScore: holdResult.summary?.weightedScore || 0,
    });
  }
  auditLog("work.report", { userId: user.id, workId: id, reportId, reason });
  sendJson(
    response,
    200,
    {
      ok: true,
      moderationStatus: holdResult.triggered ? "pending_review" : safeTrim(work.moderationStatus || "published"),
    },
    { noStore: true },
  );
};

const requireAdminUser = (request, response) => {
  const user = getRequestUser(request);
  if (!user) {
    sendJson(response, 401, { error: "请先登录" }, { noStore: true });
    return null;
  }
  if (!isAdminUser(user)) {
    sendJson(response, 403, { error: "你没有管理权限" }, { noStore: true });
    return null;
  }
  return user;
};

const handleAdminModerationList = (request, response) => {
  const user = requireAdminUser(request, response);
  if (!user) return;
  const pendingWorks = getSortedWorks()
    .filter((work) => safeTrim(work.moderationStatus) !== "published")
    .map((work) => serializeWorkForViewer(work, user));
  const recentReports = [...reports.values()]
    .sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0))
    .slice(0, 100);
  sendJson(
    response,
    200,
    {
      works: pendingWorks,
      reports: recentReports,
      reportSignals: getSortedWorks()
        .filter((work) => countDistinctReportersForWork(work.id))
        .slice(0, 50)
        .map((work) => ({ workId: work.id, title: work.title, ...buildReportSignalSummary(work.id) })),
      domains: [...domainPolicies.values()].sort((a, b) => (Number(b.updatedAt) || 0) - (Number(a.updatedAt) || 0)),
      accounts: [...accounts.entries()].map(([id, account]) => ({ id, ...account })),
    },
    { noStore: true },
  );
};

const handleAdminModerateWork = async (request, response, id) => {
  const user = requireAdminUser(request, response);
  if (!user) return;
  const existing = works.get(id);
  if (!existing) {
    sendJson(response, 404, { error: "未找到这件作品" }, { noStore: true });
    return;
  }
  let payload = {};
  try {
    payload = JSON.parse((await readRequestBody(request)) || "{}");
  } catch {
    sendJson(response, 400, { error: "请求格式不正确" }, { noStore: true });
    return;
  }
  const action = safeTrim(payload.action);
  const note = safeTrim(payload.note).slice(0, 160);
  let next = { ...existing };
  if (action === "publish") {
    next.moderationStatus = "published";
    next.moderationReasons = note ? [note] : [];
  } else if (action === "hold") {
    next.moderationStatus = "pending_review";
    next.moderationReasons = dedupeTextList([note || "管理员要求人工复核"], 8, 120);
  } else if (action === "block") {
    next.moderationStatus = "blocked";
    next.moderationReasons = dedupeTextList([note || "管理员已拦截此作品"], 8, 120);
    markAccountStrikeById(existing.authorId, note || "admin_block");
  } else if (action === "block_domain") {
    try {
      const hostname = new URL(existing.url).hostname;
      setDomainPolicy(hostname, {
        status: "blocked",
        source: "admin",
        reason: note || "管理员封禁域名",
      });
      next.moderationStatus = "blocked";
      next.moderationReasons = dedupeTextList([note || "域名已被管理员封禁"], 8, 120);
    } catch {
      sendJson(response, 400, { error: "无法识别作品域名" }, { noStore: true });
      return;
    }
  } else {
    sendJson(response, 400, { error: "不支持的审核动作" }, { noStore: true });
    return;
  }
  works.set(id, next);
  persistWorks();
  auditLog("admin.moderate_work", { adminUserId: user.id, workId: id, action, note });
  sendJson(response, 200, { ok: true, work: serializeWorkForViewer(next, user) }, { noStore: true });
};

const handleEmailSend = async (request, response) => {
  if (!enforceRateLimit(response, `auth:send:ip:${getIpHash(request)}`, 8, oneHourMs, "验证码请求过于频繁，请稍后再试")) return;
  let payload = {};
  try {
    payload = JSON.parse((await readRequestBody(request)) || "{}");
  } catch {
    sendJson(response, 400, { error: "请求格式不正确" }, { noStore: true });
    return;
  }

  const email = normalizeEmail(payload.email);
  if (!isValidEmail(email)) {
    sendJson(response, 400, { error: "请输入有效邮箱" }, { noStore: true });
    return;
  }
  if (isDisposableEmail(email)) {
    sendJson(response, 400, { error: "暂不支持一次性临时邮箱登录" }, { noStore: true });
    return;
  }
  if (!enforceRateLimit(response, `auth:send:email:${email}`, 4, 30 * 60 * 1000, "这个邮箱刚请求过验证码，请稍后再试")) return;

  const code = String(Math.floor(100000 + Math.random() * 900000));
  emailCodes.set(email, {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000,
    attempts: 0,
  });

  try {
    if (emailLoginReady()) {
      const result = await sendEmailOtp(email, code);
      console.log("[viby] email otp accepted", { email: maskEmail(email), id: result?.id || "" });
      sendJson(response, 200, { ok: true, deliveredTo: maskEmail(email) }, { noStore: true });
      return;
    }

    if (isLocalDevRequest(request)) {
      sendJson(response, 200, { ok: true, devCode: code }, { noStore: true });
      return;
    }

    sendJson(
      response,
      503,
      { error: "邮箱登录暂未配置发信服务，请先使用 GitHub 登录" },
      { noStore: true },
    );
  } catch (error) {
    console.warn("[viby] email send failed", error?.message || error);
    sendJson(response, 502, { error: "验证码发送失败，请稍后再试" }, { noStore: true });
  }
};

const handleEmailVerify = async (request, response) => {
  if (!enforceRateLimit(response, `auth:verify:ip:${getIpHash(request)}`, 20, oneHourMs, "验证尝试过于频繁，请稍后再试")) return;
  let payload = {};
  try {
    payload = JSON.parse((await readRequestBody(request)) || "{}");
  } catch {
    sendJson(response, 400, { error: "请求格式不正确" }, { noStore: true });
    return;
  }

  const email = normalizeEmail(payload.email);
  const code = String(payload.code || "").trim();
  const record = emailCodes.get(email);
  if (email && !enforceRateLimit(response, `auth:verify:email:${email}`, 12, oneHourMs, "验证尝试过于频繁，请稍后再试")) return;

  if (!isValidEmail(email) || !/^\d{6}$/.test(code) || !record) {
    sendJson(response, 400, { error: "验证码不正确或已过期" }, { noStore: true });
    return;
  }

  if (record.expiresAt < Date.now()) {
    emailCodes.delete(email);
    sendJson(response, 400, { error: "验证码不正确或已过期" }, { noStore: true });
    return;
  }

  record.attempts += 1;
  if (record.attempts > 8) {
    emailCodes.delete(email);
    sendJson(response, 429, { error: "尝试次数过多，请重新获取验证码" }, { noStore: true });
    return;
  }

  if (record.code !== code) {
    sendJson(response, 400, { error: "验证码不正确或已过期" }, { noStore: true });
    return;
  }

  emailCodes.delete(email);
  const user = createEmailLoginUser(email);
  registerLogin(user, request);
  consumeRateLimit(`account-create:${getIpHash(request)}`, 9999, oneDayMs);
  const sessionToken = signSessionUser(user);
  const maxAgeSec = 2592000;
  response.appendHeader(
    "Set-Cookie",
    `viby_session=${sessionToken}; ${cookieAttrsSessionHttpOnly(request)}; Max-Age=${maxAgeSec}`,
  );
  response.appendHeader(
    "Set-Cookie",
    `viby_session_js=${sessionToken}; ${cookieAttrsSessionReadable(request)}; Max-Age=${maxAgeSec}`,
  );
  sendJson(response, 200, { ok: true, user }, { noStore: true });
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

  response.writeHead(
    200,
    applySecurityHeaders({
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": cacheControl,
    }),
  );
  fs.createReadStream(filePath).pipe(response);
};

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (tryCanonicalHostRedirect(request, response, url)) return;
  if (!ensureTrustedMutationOrigin(request, response)) return;

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

  if (request.method === "POST" && url.pathname === "/api/safety/url-check") {
    await handleCheckUrlSafety(request, response);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/auth/email/send") {
    await handleEmailSend(request, response);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/auth/email/verify") {
    await handleEmailVerify(request, response);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/logout") {
    await readRequestBody(request);
    handleLogout(request, response);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/shares") {
    await handleCreateShare(request, response);
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/admin/moderation") {
    handleAdminModerationList(request, response);
    return;
  }

  if (request.method === "POST" && url.pathname.startsWith("/api/admin/works/") && url.pathname.endsWith("/moderate")) {
    await handleAdminModerateWork(
      request,
      response,
      decodeURIComponent(url.pathname.slice("/api/admin/works/".length, -"/moderate".length)),
    );
    return;
  }

  if (request.method === "GET" && url.pathname.startsWith("/api/shares/")) {
    const shareId = decodeURIComponent(url.pathname.slice("/api/shares/".length));
    handleGetShare(response, shareId);
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/profile") {
    handleGetProfile(request, response);
    return;
  }

  if (request.method === "PUT" && url.pathname === "/api/profile") {
    await handleUpdateProfile(request, response);
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/works") {
    handleListWorks(request, response);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/works") {
    await handleCreateWork(request, response);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/works/sync-author") {
    await handleSyncAuthorSnapshot(request, response);
    return;
  }

  if (url.pathname.startsWith("/api/works/")) {
    const workId = decodeURIComponent(url.pathname.slice("/api/works/".length));
    if (request.method === "POST" && url.pathname.endsWith("/like")) {
      handleLikeWork(request, response, decodeURIComponent(url.pathname.slice("/api/works/".length, -"/like".length)));
      return;
    }
    if (request.method === "POST" && url.pathname.endsWith("/report")) {
      await handleReportWork(
        request,
        response,
        decodeURIComponent(url.pathname.slice("/api/works/".length, -"/report".length)),
      );
      return;
    }
    if (request.method === "POST" && url.pathname.endsWith("/view")) {
      handleTrackView(request, response, decodeURIComponent(url.pathname.slice("/api/works/".length, -"/view".length)));
      return;
    }
    if (request.method === "GET") {
      handleGetWork(request, response, workId);
      return;
    }
    if (request.method === "PUT") {
      await handleUpdateWork(request, response, workId);
      return;
    }
    if (request.method === "DELETE") {
      await readRequestBody(request);
      handleDeleteWork(request, response, workId);
      return;
    }
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
