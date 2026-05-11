const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 4184);
const sessions = new Map();

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

loadEnv();

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

const cookieAttrs = (request) => {
  const secure = isHttpsRequest(request) ? "; Secure" : "";
  return `Path=/; HttpOnly; SameSite=Lax${secure}`;
};

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

const parseCookies = (request) =>
  Object.fromEntries(
    (request.headers.cookie || "")
      .split(";")
      .map((cookie) => cookie.trim().split("="))
      .filter(([key, value]) => key && value)
      .map(([key, value]) => [key, decodeURIComponent(value)]),
  );

const sendJson = (response, status, body) => {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
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

  redirect(response, url.toString(), {
    "Set-Cookie": `viby_oauth_state=${state}; ${cookieAttrs(request)}; Max-Age=600`,
  });
};

const handleGitHubCallback = async (request, response, url) => {
  const cookies = parseCookies(request);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state || state !== cookies.viby_oauth_state) {
    redirect(response, "/?github_login=failed");
    return;
  }

  try {
    const origin = getPublicOrigin(request);
    const token = await fetchGitHubJson("https://github.com/login/oauth/access_token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${origin}/api/auth/github/callback`,
      }),
    });

    if (!token.access_token) {
      redirect(response, "/?github_login=failed");
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
    const sessionId = crypto.randomBytes(32).toString("hex");

    sessions.set(sessionId, {
      id: `github-${profile.id}`,
      email: primaryEmail,
      name: profile.name || profile.login,
      avatar: profile.avatar_url,
      provider: "github",
    });

    redirect(response, "/?github_login=success", {
      "Set-Cookie": [
        `viby_session=${sessionId}; ${cookieAttrs(request)}; Max-Age=2592000`,
        `viby_oauth_state=; ${cookieAttrs(request)}; Max-Age=0`,
      ],
    });
  } catch {
    redirect(response, "/?github_login=failed");
  }
};

const handleMe = (request, response) => {
  const sessionId = parseCookies(request).viby_session;
  const user = sessionId ? sessions.get(sessionId) : null;
  sendJson(response, user ? 200 : 401, user ? { user } : { user: null });
};

const handleHealth = (response) => {
  sendJson(response, 200, {
    ok: true,
    githubOAuthReady: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
  });
};

const handleLogout = (request, response) => {
  response.writeHead(204, {
    "Set-Cookie": `viby_session=; ${cookieAttrs(request)}; Max-Age=0`,
  });
  response.end();
};

const serveStatic = (request, response, url) => {
  const requestPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.normalize(path.join(root, requestPath));

  if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream",
  });
  fs.createReadStream(filePath).pipe(response);
};

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

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
  const callbackUrl = process.env.PUBLIC_ORIGIN
    ? `${process.env.PUBLIC_ORIGIN.replace(/\/$/, "")}/api/auth/github/callback`
    : `http://localhost:${port}/api/auth/github/callback`;
  console.log(`Viby listening on http://${host}:${port}`);
  console.log(`GitHub OAuth「Authorization callback URL」填：${callbackUrl}`);
  console.log("反代 HTTPS 时 Nginx 需设置：proxy_set_header X-Forwarded-Proto $scheme; 或在 .env 设置 PUBLIC_ORIGIN=https://你的域名");
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    console.warn("[viby] GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET 未配置，GitHub 登录不可用");
  }
});
