const root = document.documentElement;
const panel = document.querySelector(".submit-panel");
const openButtons = document.querySelectorAll("[data-open-submit]");
const closeButton = document.querySelector("[data-close-submit]");
const rankButtons = document.querySelectorAll("[data-rank]");
const loginOverlay = document.querySelector(".login-overlay");
const openLoginButton = document.querySelector("[data-open-login]");
const closeLoginButton = document.querySelector("[data-close-login]");
const githubLoginButton = document.querySelector("[data-github-login]");
const sendCodeButton = document.querySelector("[data-send-code]");
const loginForm = document.querySelector("#loginForm");
const workGrid = document.querySelector("#workGrid");
const submitForm = document.querySelector("#submitForm");
const statWorks = document.querySelector("#statWorks");
const statViews = document.querySelector("#statViews");
const statLikes = document.querySelector("#statLikes");
const toast = document.querySelector(".toast");
const coverInput = submitForm.querySelector('[name="cover"]');
const coverCropper = document.querySelector("#coverCropper");
const pickCoverButton = document.querySelector("[data-pick-cover]");
const confirmCropButton = document.querySelector("[data-confirm-crop]");
const cancelCropButton = document.querySelector("[data-cancel-crop]");
const coverThumb = document.querySelector("#coverThumb");
const coverThumbs = document.querySelector("#coverThumbs");
const coverPreview = document.querySelector("#coverPreview");
const cropBox = document.querySelector("#cropBox");
const detailOverlay = document.querySelector(".detail-overlay");
const closeDetailButton = document.querySelector("[data-close-detail]");
const detailCover = document.querySelector("#detailCover");
const detailType = document.querySelector("#detailType");
const detailTitle = document.querySelector("#detailTitle");
const detailDescription = document.querySelector("#detailDescription");
const detailMeta = document.querySelector("#detailMeta");
const detailLikes = document.querySelector("#detailLikes");
const detailViews = document.querySelector("#detailViews");
const detailDate = document.querySelector("#detailDate");
const detailActions = document.querySelector("#detailActions");
const profileOverlay = document.querySelector(".profile-overlay");
const profileEntryButton = document.querySelector("[data-open-profile]");
const closeProfileButton = document.querySelector("[data-close-profile]");
const profileAvatarInput = document.querySelector("#profileAvatarInput");
const profileAvatarPreview = document.querySelector("#profileAvatarPreview");
const profileDisplayNameInput = document.querySelector("#profileDisplayName");
const profileEmailLine = document.querySelector("#profileEmailLine");
const profileStatWorksEl = document.querySelector("#profileStatWorks");
const profileStatViewsEl = document.querySelector("#profileStatViews");
const profileStatLikesEl = document.querySelector("#profileStatLikes");
const profileWorksGrid = document.querySelector("#profileWorksGrid");
const profileSaveButton = document.querySelector("[data-profile-save]");
const profileLogoutButton = document.querySelector("[data-profile-logout]");
const profileResetAvatarButton = document.querySelector("[data-profile-reset-avatar]");

const storageKey = "viby-works";
const authKey = "viby-user";
const profilePrefsKey = "viby-profile-prefs";
const accountsKey = "viby-accounts";
const interactionsKey = "viby-interactions";
const emailCodeKey = "viby-email-code";
const oneDay = 24 * 60 * 60 * 1000;

const seedWorks = [
  {
    id: "briefly",
    title: "灵感卡片",
    description: "把一个产品想法整理成清晰的功能卡片和首屏文案。",
    url: "https://example.com/briefly",
    github: "",
    category: "app",
    type: "App",
    tool: "Claude Code",
    stack: "React",
    visual: "visual-one",
    cover: "",
    createdAt: Date.now() - 2 * oneDay,
    views: 1280,
    likes: 42,
  },
  {
    id: "form-echo",
    title: "Form Echo",
    description: "给独立开发者用的轻量反馈收集组件。",
    url: "https://example.com/form-echo",
    github: "https://github.com",
    category: "website",
    type: "Website",
    tool: "Cursor",
    stack: "GitHub",
    visual: "visual-two",
    cover: "",
    createdAt: Date.now() - 13 * oneDay,
    views: 2104,
    likes: 67,
  },
  {
    id: "tiny-invoice",
    title: "Tiny Invoice",
    description: "输入项目和金额，一键生成漂亮发票页面。",
    url: "https://example.com/tiny-invoice",
    github: "",
    category: "website",
    type: "Website",
    tool: "v0",
    stack: "Supabase",
    visual: "visual-three",
    cover: "",
    createdAt: Date.now() - 35 * oneDay,
    views: 1416,
    likes: 31,
  },
  {
    id: "launch-desk",
    title: "Launch Desk",
    description: "帮独立开发者整理发布清单、素材和复盘记录。",
    url: "https://example.com/launch-desk",
    github: "",
    category: "website",
    type: "Website",
    tool: "Cursor",
    stack: "Live",
    visual: "visual-one",
    cover: "",
    createdAt: Date.now() - 4 * oneDay,
    views: 842,
    likes: 29,
  },
  {
    id: "habit-pulse",
    title: "Habit Pulse",
    description: "一个轻量习惯追踪 APP，用柔和图表展示每天的进展。",
    url: "https://example.com/habit-pulse",
    github: "",
    category: "app",
    type: "App",
    tool: "v0",
    stack: "Live",
    visual: "visual-two",
    cover: "",
    createdAt: Date.now() - 5 * oneDay,
    views: 733,
    likes: 25,
  },
  {
    id: "note-garden",
    title: "Note Garden",
    description: "把零散笔记变成可检索的个人知识花园。",
    url: "https://example.com/note-garden",
    github: "",
    category: "website",
    type: "Website",
    tool: "Claude Code",
    stack: "Live",
    visual: "visual-three",
    cover: "",
    createdAt: Date.now() - 8 * oneDay,
    views: 1012,
    likes: 34,
  },
  {
    id: "fit-screen",
    title: "Fit Screen",
    description: "根据不同设备尺寸快速预览页面视觉效果。",
    url: "https://example.com/fit-screen",
    github: "",
    category: "app",
    type: "App",
    tool: "Cursor",
    stack: "Live",
    visual: "visual-one",
    cover: "",
    createdAt: Date.now() - 18 * oneDay,
    views: 618,
    likes: 18,
  },
  {
    id: "copy-room",
    title: "Copy Room",
    description: "为产品页面生成多版本标题、卖点和行动按钮。",
    url: "https://example.com/copy-room",
    github: "",
    category: "website",
    type: "Website",
    tool: "Claude Code",
    stack: "Live",
    visual: "visual-two",
    cover: "",
    createdAt: Date.now() - 28 * oneDay,
    views: 940,
    likes: 21,
  },
];

let works = [];
let activeRank = "latest";
let selectedCover = null;
let cropQueue = [];
let cropIndex = 0;
let croppedCovers = [];
let sourceCovers = [];
let editingCoverIndex = null;
let cropBoxState = null;
let pendingProfileAvatar = null;

const escapeHTML = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const getStoredWorks = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(storageKey) || "null");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
};

const getAccounts = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(accountsKey) || "null");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
};

const saveAccounts = (accounts) => {
  localStorage.setItem(accountsKey, JSON.stringify(accounts));
};

const getInteractions = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(interactionsKey) || "null");
    return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  } catch {
    return {};
  }
};

const saveInteractions = (interactions) => {
  localStorage.setItem(interactionsKey, JSON.stringify(interactions));
};

const getProfilePrefsMap = () => {
  try {
    return JSON.parse(localStorage.getItem(profilePrefsKey)) || {};
  } catch {
    return {};
  }
};

const getProfilePrefs = (userId) => (userId ? getProfilePrefsMap()[userId] || {} : {});

const setProfilePrefs = (userId, patch) => {
  if (!userId) return;
  const map = getProfilePrefsMap();
  map[userId] = { ...getProfilePrefs(userId), ...patch };
  localStorage.setItem(profilePrefsKey, JSON.stringify(map));
};

const fileToAvatarDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const image = new Image();
      image.addEventListener("load", () => {
        const canvas = document.createElement("canvas");
        const size = 160;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.88));
      });
      image.addEventListener("error", reject);
      image.src = reader.result;
    });
    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });

const getProfilePresentation = (user) => {
  if (!user) return { displayName: "", avatarUrl: "" };
  const prefs = getProfilePrefs(user.id);
  const displayName = String(
    prefs.displayName || user.name || (user.email || "").split("@")[0] || "创作者",
  ).trim();
  const avatarUrl = prefs.avatarDataUrl || user.avatar || "";
  return { displayName, avatarUrl };
};

const getUserWorks = (userId) =>
  works.filter((work) => work.isUserCreated && work.authorId === userId);

const migrateWorksAuthor = () => {
  const user = getUser();
  if (!user) return;
  let changed = false;
  works.forEach((work) => {
    if (work.isUserCreated && !work.authorId) {
      work.authorId = user.id;
      changed = true;
    }
  });
  if (changed) saveUserWorks();
};

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(authKey));
  } catch {
    return null;
  }
};

const updateLoginState = () => {
  const user = getUser();
  if (user) {
    migrateWorksAuthor();
    openLoginButton.hidden = true;
    profileEntryButton.hidden = false;
    const { displayName, avatarUrl } = getProfilePresentation(user);
    const avatarEl = profileEntryButton.querySelector(".profile-entry-avatar");
    const labelEl = profileEntryButton.querySelector(".profile-entry-label");
    if (avatarEl) {
      avatarEl.src = avatarUrl || "./logo-source.png";
      avatarEl.alt = displayName;
    }
    if (labelEl) labelEl.textContent = displayName;
  } else {
    openLoginButton.hidden = false;
    profileEntryButton.hidden = true;
  }
};

const closeProfile = () => {
  profileOverlay.classList.remove("is-open");
  profileOverlay.setAttribute("aria-hidden", "true");
  pendingProfileAvatar = null;
};

const renderProfilePanel = () => {
  const user = getUser();
  if (!user || !profileWorksGrid) return;

  const { displayName, avatarUrl } = getProfilePresentation(user);
  profileDisplayNameInput.value = displayName;
  profileEmailLine.textContent = user.email || "";
  profileAvatarPreview.src = pendingProfileAvatar || avatarUrl || "./logo-source.png";
  profileAvatarPreview.alt = displayName;

  const list = getUserWorks(user.id).sort((a, b) => b.createdAt - a.createdAt);
  const viewsSum = list.reduce((s, w) => s + (w.views || 0), 0);
  const likesSum = list.reduce((s, w) => s + (w.likes || 0), 0);
  profileStatWorksEl.textContent = list.length;
  profileStatViewsEl.textContent = formatNumber(viewsSum);
  profileStatLikesEl.textContent = formatNumber(likesSum);

  profileWorksGrid.innerHTML = list.length
    ? list
        .map(
          (work) => `
        <button type="button" class="profile-work-tile" data-open-work="${work.id}">
          <div class="profile-work-tile-visual ${work.cover ? "has-cover" : work.visual}">
            ${work.cover ? `<img src="${work.cover}" alt="" />` : ""}
          </div>
          <div class="profile-work-tile-body">
            <p class="profile-work-tile-title">${escapeHTML(work.title)}</p>
            <div class="profile-work-tile-meta">
              <span>${formatNumber(work.views)} 访问</span>
              <span>${formatNumber(work.likes)} 赞</span>
            </div>
          </div>
        </button>
      `,
        )
        .join("")
    : `<div class="profile-empty">还没有作品。去发布一条，它会出现在这里。</div>`;

  profileWorksGrid.querySelectorAll("[data-open-work]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeProfile();
      openDetail(btn.dataset.openWork);
    });
  });
};

const openProfile = async (options = {}) => {
  const fromLoginNav = options.fromLoginNav === true;
  await syncServerSession();
  if (!getUser()) {
    openLogin();
    if (!fromLoginNav) showToast("需要先登录才能打开个人主页");
    return;
  }
  closeLogin();
  pendingProfileAvatar = null;
  renderProfilePanel();
  profileOverlay.classList.add("is-open");
  profileOverlay.setAttribute("aria-hidden", "false");
};

let vibyBackend = {
  checked: false,
  apiOnline: false,
  githubOAuthReady: false,
  problem: null,
};

let backendProbePromise = null;

const probeBackend = async () => {
  if (window.location.protocol === "file:") {
    vibyBackend = { checked: true, apiOnline: false, githubOAuthReady: false, problem: "file" };
    return vibyBackend;
  }

  try {
    const response = await fetch("/api/health", { credentials: "same-origin", cache: "no-store" });
    if (response.status === 404) {
      vibyBackend = { checked: true, apiOnline: false, githubOAuthReady: false, problem: "static_server" };
      return vibyBackend;
    }

    if (!response.ok) {
      vibyBackend = { checked: true, apiOnline: false, githubOAuthReady: false, problem: "bad_response" };
      return vibyBackend;
    }

    const data = await response.json();
    vibyBackend = {
      checked: true,
      apiOnline: true,
      githubOAuthReady: Boolean(data.githubOAuthReady),
      problem: null,
    };
    return vibyBackend;
  } catch {
    vibyBackend = { checked: true, apiOnline: false, githubOAuthReady: false, problem: "network" };
    return vibyBackend;
  }
};

const ensureBackendProbe = () => {
  if (!backendProbePromise) backendProbePromise = probeBackend();
  return backendProbePromise;
};

/** 读取非 HttpOnly 的 viby_session_js（或同站点其它 Cookie） */
const readDocumentCookie = (name) => {
  const needle = `; ${name}=`;
  const all = `; ${document.cookie}`;
  const i = all.indexOf(needle);
  if (i === -1) return "";
  const start = i + needle.length;
  const end = all.indexOf("; ", start);
  const chunk = end === -1 ? all.slice(start) : all.slice(start, end);
  try {
    return decodeURIComponent(chunk) || "";
  } catch {
    return chunk;
  }
};

const syncServerSession = async () => {
  try {
    const jsTok = readDocumentCookie("viby_session_js");
    const headers = {};
    if (jsTok) headers["X-Viby-Session"] = jsTok;

    const response = await fetch("/api/me", { credentials: "include", cache: "no-store", headers });
    if (response.status === 404) return null;

    let data = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (response.status === 401) {
      localStorage.removeItem(authKey);
      document.cookie = "viby_session_js=; Path=/; Max-Age=0; SameSite=Lax";
      updateLoginState();
      return null;
    }

    if (!response.ok) return null;
    if (!data.user) return null;

    localStorage.setItem(
      authKey,
      JSON.stringify({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        avatar: data.user.avatar,
        provider: data.user.provider,
      }),
    );
    updateLoginState();
    return data.user;
  } catch {
    return null;
  }
};

const handleAuthRedirectMessage = () => {
  const params = new URLSearchParams(window.location.search);
  const result = params.get("github_login");
  if (!result) return;

  if (result === "success") {
    if (getUser()) {
      showToast("GitHub 登录成功");
    } else {
      showToast("GitHub 已授权，但未建立会话。请检查 Cookie、密钥是否与 GitHub 一致，或刷新后重试");
    }
  } else if (result === "not_configured") {
    showToast("GitHub 未就绪：在项目根目录创建 .env，写入 GITHUB_CLIENT_ID 与 GITHUB_CLIENT_SECRET，保存后重新执行 npm start");
  } else {
    const glErr = params.get("github_err") || "";
    const origin = window.location.origin;
    const callbackUrl = `${origin}/api/auth/github/callback`;
    const byErr = {
      state:
        "登录校验失败：浏览器未带上临时 Cookie。请关闭广告/隐私拦截、允许本站 Cookie，并全程用同一地址访问（例如 " +
        origin +
        "）。",
      missing: "缺少授权参数，请在本站重新点击「使用 GitHub 登录」。",
      code: "授权码已过期或无效，请再点一次 GitHub 登录。",
      uri: `GitHub 提示回调地址不一致。请在 GitHub OAuth App 里将回调设为（完全一致）：${callbackUrl}，且服务器 .env 中 PUBLIC_ORIGIN=${origin}`,
      secret: "GitHub 拒绝：Client ID 或 Client Secret 与后台不一致，请核对 .env 与 GitHub OAuth App。",
      token: "与 GitHub 交换令牌失败，可在服务器执行 pm2 logs viby 查看 [viby] GitHub token error。",
      net: "服务器处理登录时出错，请稍后重试或查看 pm2 logs。",
      denied: "你已取消 GitHub 授权，如需登录请重试。",
      github: "GitHub 返回错误，请稍后重试。",
    };
    showToast(
      byErr[glErr] ||
        `GitHub 登录未完成。请确认 OAuth 回调地址为：${callbackUrl}，且用 Node 提供 /api（勿纯静态托管）。`,
    );
  }

  params.delete("github_login");
  params.delete("github_err");
  const nextUrl = `${window.location.pathname}${params.toString() ? `?${params}` : ""}${window.location.hash}`;
  window.history.replaceState({}, "", nextUrl);
};

const getVisualClass = (index) => ["visual-one", "visual-two", "visual-three"][index % 3];

const normalizeWork = (work, index = 0) => ({
  ...work,
  cover: work.cover || "",
  photos: work.photos || (work.cover ? [work.cover] : []),
  tool: work.tool === "Vibe coding" ? "" : work.tool,
  createdAt: work.createdAt || Date.now() - index * oneDay,
  likes: Number.isFinite(work.likes) ? work.likes : work.saves || 0,
  likedBy: work.likedBy || [],
  views: work.views || 0,
  visual: work.visual || getVisualClass(index),
  authorId: work.authorId || "",
});

const applyInteractions = () => {
  const interactions = getInteractions();
  works = works.map((work) => {
    const likedBy = interactions[work.id]?.likedBy || work.likedBy || [];
    const extraLikes = Math.max(0, likedBy.length - (work.likedBy?.length || 0));
    return {
      ...work,
      likedBy,
      likes: work.likes + extraLikes,
    };
  });
};

const saveUserWorks = () => {
  localStorage.setItem(
    storageKey,
    JSON.stringify(works.filter((work) => work.isUserCreated)),
  );
};

const formatNumber = (value) => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  }

  return String(value);
};

const formatDate = (timestamp) =>
  new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
  }).format(new Date(timestamp));

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2200);
};

const getTypeLabel = (category) => {
  if (category.includes("website")) return "Website";
  if (category.includes("app")) return "App";
  if (category.includes("open")) return "Open source";
  if (category.includes("ai")) return "AI app";
  return "Tool";
};

const getCategoryText = (category) =>
  category
    .replace("website", "网站")
    .replace("app", "APP")
    .replace("open", "开源")
    .replace("tool", "小工具")
    .replace("ai", "AI 应用");

const getSelectedDevices = () => {
  const devices = [...submitForm.querySelectorAll('[name="devices"]:checked')].map(
    (input) => input.value,
  );
  return devices.length ? devices : ["电脑端"];
};

const updateStats = () => {
  statWorks.textContent = works.length;
  statViews.textContent = formatNumber(works.reduce((sum, work) => sum + work.views, 0));
  statLikes.textContent = formatNumber(works.reduce((sum, work) => sum + work.likes, 0));
};

const likeWork = (id) => {
  const user = getUser();
  if (!user) {
    openLogin();
    showToast("登录后才能点赞");
    return false;
  }

  const work = works.find((item) => item.id === id);
  if (!work) return false;

  work.likedBy = work.likedBy || [];
  if (work.likedBy.includes(user.id)) {
    showToast("你已经给这个作品点过赞了");
    return false;
  }

  work.likedBy.push(user.id);
  work.likes += 1;

  const interactions = getInteractions();
  interactions[id] = { ...(interactions[id] || {}), likedBy: work.likedBy };
  saveInteractions(interactions);
  saveUserWorks();
  showToast("已点赞，榜单会实时更新");
  return true;
};

const bindTilt = (cards) => {
  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateX = (y / rect.height - 0.5) * -5;
      const rotateY = (x / rect.width - 0.5) * 5;

      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
};

const getRankedWorks = () => {
  const now = Date.now();
  const ranked = [...works];

  if (activeRank === "latest") {
    return ranked.sort((a, b) => b.createdAt - a.createdAt);
  }

  const cutoff =
    activeRank === "week"
      ? now - 7 * oneDay
      : activeRank === "month"
        ? now - 30 * oneDay
        : 0;

  return ranked
    .filter((work) => work.createdAt >= cutoff)
    .sort((a, b) => b.likes - a.likes || b.views - a.views || b.createdAt - a.createdAt);
};

const renderWorks = () => {
  const visibleWorks = getRankedWorks().slice(0, 6);
  const rankLabels = ["1", "2", "3"];

  workGrid.innerHTML = visibleWorks
    .map(
      (work, index) => `
        <article class="work-card" data-id="${work.id}" data-category="${work.category}" data-tilt>
          <div class="rank-badge ${index < 3 ? `rank-featured rank-${index + 1}` : ""}">${rankLabels[index] || index + 1}</div>
          <div class="work-visual ${work.cover ? "has-cover" : work.visual}">
            ${work.cover ? `<img src="${work.cover}" alt="${escapeHTML(work.title)} 封面" />` : ""}
          </div>
          <div class="work-content">
            <h3>${escapeHTML(work.title)}</h3>
            <p>${escapeHTML(work.description)}</p>
            <div class="work-meta">
              <span>${escapeHTML(getCategoryText(work.category))}</span>
              <span>${escapeHTML((work.devices || ["电脑端"]).join(" / "))}</span>
            </div>
            <div class="work-actions">
              <a href="${work.url}" target="_blank" rel="noreferrer" data-visit="${work.id}">访问作品</a>
              ${work.github ? `<a href="${work.github}" target="_blank" rel="noreferrer">GitHub</a>` : ""}
              <button type="button" data-like="${work.id}">点赞 ${work.likes}</button>
            </div>
          </div>
        </article>
      `,
    )
    .join("");

  bindTilt(workGrid.querySelectorAll("[data-tilt]"));
  updateStats();
};

const openPanel = async () => {
  await syncServerSession();
  if (!getUser()) {
    openLogin();
    showToast("请先登录后再发布作品");
    return;
  }
  closeLogin();
  panel.classList.add("is-open");
  panel.setAttribute("aria-hidden", "false");
};

const closePanel = () => {
  panel.classList.remove("is-open");
  panel.setAttribute("aria-hidden", "true");
};

const openCropper = () => {
  coverCropper.classList.add("is-open");
  coverCropper.setAttribute("aria-hidden", "false");
};

const closeCropper = () => {
  coverCropper.classList.remove("is-open");
  coverCropper.setAttribute("aria-hidden", "true");
};

const openLogin = () => {
  loginOverlay.classList.add("is-open");
  loginOverlay.setAttribute("aria-hidden", "false");
};

const closeLogin = () => {
  loginOverlay.classList.remove("is-open");
  loginOverlay.setAttribute("aria-hidden", "true");
};

const openDetail = (id) => {
  const work = works.find((item) => item.id === id);
  if (!work) return;

  const photos = work.photos?.length ? work.photos : work.cover ? [work.cover] : [];
  detailCover.className = `detail-cover ${photos.length ? "has-cover" : work.visual}`;
  detailCover.innerHTML = photos.length
    ? `
      <div class="detail-gallery photo-${Math.min(photos.length, 5)}">
        ${photos.map((photo, index) => `<img src="${photo}" alt="${escapeHTML(work.title)} 截图 ${index + 1}" />`).join("")}
      </div>
    `
    : "";
  detailType.textContent = work.type;
  detailTitle.textContent = work.title;
  detailDescription.textContent = work.description;
  detailMeta.innerHTML = [
    work.tool,
    work.stack || "Live",
    (work.devices || ["电脑端"]).join(" / "),
    getCategoryText(work.category),
  ]
    .filter(Boolean)
    .map((item) => `<span>${escapeHTML(item)}</span>`)
    .join("");
  detailLikes.textContent = work.likes;
  detailViews.textContent = formatNumber(work.views);
  detailDate.textContent = formatDate(work.createdAt);
  detailActions.innerHTML = `
    <a href="${work.url}" target="_blank" rel="noreferrer" data-visit="${work.id}">访问作品</a>
    ${work.github ? `<a href="${work.github}" target="_blank" rel="noreferrer">GitHub</a>` : ""}
    <button type="button" data-like="${work.id}">点赞 ${work.likes}</button>
  `;

  detailOverlay.classList.add("is-open");
  detailOverlay.setAttribute("aria-hidden", "false");
};

const closeDetail = () => {
  detailOverlay.classList.remove("is-open");
  detailOverlay.setAttribute("aria-hidden", "true");
};

const updateCoverPreview = () => {
  if (!selectedCover) return "";
  coverPreview.style.width = "100%";
  coverPreview.style.height = "100%";
  coverPreview.style.transform = "";
  cropBox.style.left = `${selectedCover.box?.x ?? 12}%`;
  cropBox.style.top = `${selectedCover.box?.y ?? 18}%`;
  cropBox.style.width = `${selectedCover.box?.w ?? 76}%`;
  cropBox.style.height = `${selectedCover.box?.h ?? 64}%`;
};

const createCroppedCover = async () => {
  if (!selectedCover) return "";
  const image = new Image();
  image.src = selectedCover.src;
  await image.decode();

  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 675;
  const context = canvas.getContext("2d");
  const box = selectedCover.box || { x: 0, y: 0, w: 100, h: 100 };
  const imageRatio = image.width / image.height;
  const frameRatio = coverPreview.parentElement.clientWidth / coverPreview.parentElement.clientHeight;
  let visibleWidth = image.width;
  let visibleHeight = image.height;
  let offsetX = 0;
  let offsetY = 0;

  if (imageRatio > frameRatio) {
    visibleHeight = image.height;
    visibleWidth = image.height * frameRatio;
    offsetX = (image.width - visibleWidth) / 2;
  } else {
    visibleWidth = image.width;
    visibleHeight = image.width / frameRatio;
    offsetY = (image.height - visibleHeight) / 2;
  }

  const sx = offsetX + (box.x / 100) * visibleWidth;
  const sy = offsetY + (box.y / 100) * visibleHeight;
  const sw = (box.w / 100) * visibleWidth;
  const sh = (box.h / 100) * visibleHeight;

  context.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.86);
};

window.addEventListener("pointermove", (event) => {
  root.style.setProperty("--spot-x", `${event.clientX}px`);
  root.style.setProperty("--spot-y", `${event.clientY}px`);
});

openButtons.forEach((button) => button.addEventListener("click", () => void openPanel()));
closeButton.addEventListener("click", closePanel);

panel.addEventListener("click", (event) => {
  if (event.target === panel) closePanel();
});

openLoginButton.addEventListener("click", () => void openProfile({ fromLoginNav: true }));
closeLoginButton.addEventListener("click", closeLogin);
loginOverlay.addEventListener("click", (event) => {
  if (event.target === loginOverlay) closeLogin();
});

sendCodeButton.addEventListener("click", () => {
  const email = new FormData(loginForm).get("email").trim().toLowerCase();
  if (!email) {
    showToast("先填写邮箱");
    return;
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  localStorage.setItem(emailCodeKey, JSON.stringify({ email, code, expiresAt: Date.now() + 10 * 60 * 1000 }));
  showToast(`验证码已发送：${code}`);
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(loginForm);
  const email = data.get("email").trim().toLowerCase();
  const code = data.get("code").trim();
  if (!email || !code) return;

  const storedCode = JSON.parse(localStorage.getItem(emailCodeKey) || "{}");
  if (storedCode.email !== email || storedCode.code !== code || storedCode.expiresAt < Date.now()) {
    showToast("验证码不正确或已过期");
    return;
  }

  const accounts = getAccounts();
  let account = accounts.find((item) => item.email === email);

  if (!account) {
    account = {
      id: `user-${Date.now()}`,
      email,
      createdAt: Date.now(),
    };
    accounts.push(account);
    saveAccounts(accounts);
  }

  localStorage.setItem(authKey, JSON.stringify({ id: account.id, email: account.email }));
  localStorage.removeItem(emailCodeKey);
  updateLoginState();
  closeLogin();
  showToast(`欢迎回来，${email.split("@")[0]}`);
});

githubLoginButton.addEventListener("click", async () => {
  await ensureBackendProbe();

  if (vibyBackend.problem === "file") {
    showToast("请在本项目目录执行 npm start，在浏览器打开显示的地址，不要直接双击打开 HTML");
    return;
  }

  if (!vibyBackend.apiOnline) {
    showToast("当前页面不是由 Viby 启动的服务（常见：用了 python -m http.server）。请在项目目录执行 npm start 后再点 GitHub 登录");
    return;
  }

  if (!vibyBackend.githubOAuthReady) {
    showToast("请在 .env 中配置 GITHUB_CLIENT_ID 和 GITHUB_CLIENT_SECRET，保存后重新 npm start");
    return;
  }

  window.location.href = "/api/auth/github";
});

profileEntryButton.addEventListener("click", () => void openProfile());
closeProfileButton.addEventListener("click", closeProfile);
profileOverlay.addEventListener("click", (event) => {
  if (event.target === profileOverlay) closeProfile();
});

profileAvatarInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showToast("请选择图片文件");
    profileAvatarInput.value = "";
    return;
  }
  try {
    pendingProfileAvatar = await fileToAvatarDataUrl(file);
    profileAvatarPreview.src = pendingProfileAvatar;
  } catch {
    showToast("头像读取失败，请换一张试试");
  }
  profileAvatarInput.value = "";
});

profileSaveButton.addEventListener("click", () => {
  const user = getUser();
  if (!user) return;
  const name = profileDisplayNameInput.value.trim();
  if (!name) {
    showToast("请填写展示名称");
    return;
  }
  const patch = { displayName: name };
  if (pendingProfileAvatar) patch.avatarDataUrl = pendingProfileAvatar;
  setProfilePrefs(user.id, patch);
  pendingProfileAvatar = null;
  updateLoginState();
  renderProfilePanel();
  showToast("资料已保存");
});

profileResetAvatarButton.addEventListener("click", () => {
  const user = getUser();
  if (!user) return;
  const prefs = { ...getProfilePrefs(user.id) };
  if (!prefs.avatarDataUrl) {
    showToast("当前已是默认头像");
    return;
  }
  delete prefs.avatarDataUrl;
  const map = getProfilePrefsMap();
  map[user.id] = prefs;
  localStorage.setItem(profilePrefsKey, JSON.stringify(map));
  pendingProfileAvatar = null;
  updateLoginState();
  renderProfilePanel();
  showToast("已恢复默认头像");
});

profileLogoutButton.addEventListener("click", async () => {
  try {
    await fetch("/api/logout", { method: "POST", credentials: "include", cache: "no-store" });
  } catch {
    /* static 托管或网络异常时仍清理本地态 */
  }
  localStorage.removeItem(authKey);
  document.cookie = "viby_session_js=; Path=/; Max-Age=0; SameSite=Lax";
  closeProfile();
  updateLoginState();
  renderWorks();
  showToast("已退出登录");
});

closeDetailButton.addEventListener("click", closeDetail);
detailOverlay.addEventListener("click", (event) => {
  if (event.target === detailOverlay) closeDetail();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePanel();
    closeDetail();
    closeCropper();
    closeLogin();
    closeProfile();
  }

  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    void openPanel();
  }
});

rankButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeRank = button.dataset.rank;
    rankButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderWorks();
  });
});

workGrid.addEventListener("click", (event) => {
  const visitLink = event.target.closest("[data-visit]");
  const likeButton = event.target.closest("[data-like]");
  const card = event.target.closest(".work-card");

  if (visitLink) {
    const work = works.find((item) => item.id === visitLink.dataset.visit);
    if (work) {
      work.views += 1;
      saveUserWorks();
      updateStats();
    }
    return;
  }

  if (likeButton) {
    if (likeWork(likeButton.dataset.like)) {
      renderWorks();
    }
    return;
  }

  if (card) openDetail(card.dataset.id);
});

detailActions.addEventListener("click", (event) => {
  const visitLink = event.target.closest("[data-visit]");
  const likeButton = event.target.closest("[data-like]");

  if (visitLink) {
    const work = works.find((item) => item.id === visitLink.dataset.visit);
    if (work) {
      work.views += 1;
      saveUserWorks();
      updateStats();
    }
    return;
  }

  if (likeButton) {
    if (likeWork(likeButton.dataset.like)) {
      const work = works.find((item) => item.id === likeButton.dataset.like);
      openDetail(work.id);
      renderWorks();
    }
  }
});

const readImageFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const image = new Image();
      image.addEventListener("load", () => {
        resolve({
          src: reader.result,
          width: image.width,
          height: image.height,
          box: { x: 0, y: 0, w: 100, h: 100 },
        });
      });
      image.addEventListener("error", reject);
      image.src = reader.result;
    });
    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });

const renderCoverThumbs = () => {
  coverThumbs.innerHTML = croppedCovers
    .map(
      (src, index) => `
        <button class="thumb-item ${index === 0 ? "is-cover" : ""}" type="button" draggable="true" data-index="${index}" title="${index === 0 ? "封面" : "拖动调整顺序"}">
          <img src="${src}" alt="作品截图 ${index + 1}" />
          ${index === 0 ? "<span>封面</span>" : ""}
        </button>
      `,
    )
    .join("");

  if (croppedCovers.length && croppedCovers.length < 5) {
    coverThumbs.insertAdjacentHTML("beforeend", `<label class="thumb-add" for="coverInput">+</label>`);
  }

  if (croppedCovers.length) {
    coverThumb.src = croppedCovers[0];
    coverThumb.hidden = false;
    pickCoverButton.classList.add("has-image");
  } else {
    coverThumb.hidden = true;
    coverThumb.removeAttribute("src");
    pickCoverButton.classList.remove("has-image");
  }
};

const openCropAtIndex = () => {
  selectedCover = cropQueue[cropIndex];
  if (!selectedCover) {
    closeCropper();
    renderCoverThumbs();
    showToast(`${croppedCovers.length} 张截图已就绪`);
    return;
  }

  coverPreview.src = selectedCover.src;
  selectedCover.box = selectedCover.box || { x: 0, y: 0, w: 100, h: 100 };
  requestAnimationFrame(updateCoverPreview);
  confirmCropButton.textContent = `确认这一张 ${cropIndex + 1}/${cropQueue.length}`;
  openCropper();
};

coverInput.addEventListener("change", async () => {
  const remainingSlots = 5 - croppedCovers.length;
  if (remainingSlots <= 0) {
    showToast("最多上传 5 张照片");
    coverInput.value = "";
    return;
  }

  const files = [...coverInput.files].slice(0, remainingSlots);
  if (!files.length) return;

  if (coverInput.files.length > remainingSlots) {
    showToast(`还可以上传 ${remainingSlots} 张，已自动截取`);
  }

  try {
    cropQueue = await Promise.all(files.map(readImageFile));
    cropIndex = 0;
    coverInput.value = "";
    openCropAtIndex();
  } catch {
    showToast("图片读取失败，请换一张试试");
  }
});

cropBox.addEventListener("pointerdown", (event) => {
  if (!selectedCover) return;
  event.preventDefault();
  const handle = event.target.tagName === "SPAN" ? [...cropBox.children].indexOf(event.target) : -1;
  cropBoxState = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    box: { ...selectedCover.box },
    handle,
  };
  cropBox.setPointerCapture(event.pointerId);
  cropBox.classList.add("is-dragging");
});

coverPreview.parentElement.addEventListener("pointerdown", (event) => {
  if (!selectedCover || event.target !== coverPreview.parentElement) return;
  event.preventDefault();
  const frame = coverPreview.parentElement.getBoundingClientRect();
  const x = ((event.clientX - frame.left) / frame.width) * 100;
  const y = ((event.clientY - frame.top) / frame.height) * 100;
  selectedCover.box = { x, y, w: 1, h: 1 };
  cropBoxState = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    box: { ...selectedCover.box },
    handle: 3,
    drawing: true,
  };
  cropBox.style.pointerEvents = "none";
  coverPreview.parentElement.setPointerCapture(event.pointerId);
  updateCoverPreview();
});

cropBox.addEventListener("pointermove", (event) => {
  if (!cropBoxState || cropBoxState.pointerId !== event.pointerId || !selectedCover) return;
  const frame = coverPreview.parentElement.getBoundingClientRect();
  const dx = ((event.clientX - cropBoxState.startX) / frame.width) * 100;
  const dy = ((event.clientY - cropBoxState.startY) / frame.height) * 100;
  const box = { ...cropBoxState.box };

  if (cropBoxState.handle === -1) {
    box.x += dx;
    box.y += dy;
  } else {
    if ([0, 2].includes(cropBoxState.handle)) {
      box.x += dx;
      box.w -= dx;
    }
    if ([1, 3].includes(cropBoxState.handle)) box.w += dx;
    if ([0, 1].includes(cropBoxState.handle)) {
      box.y += dy;
      box.h -= dy;
    }
    if ([2, 3].includes(cropBoxState.handle)) box.h += dy;
  }

  box.w = Math.max(8, Math.min(100, box.w));
  box.h = Math.max(8, Math.min(100, box.h));
  box.x = Math.max(0, Math.min(100 - box.w, box.x));
  box.y = Math.max(0, Math.min(100 - box.h, box.y));
  selectedCover.box = box;
  updateCoverPreview();
});

coverPreview.parentElement.addEventListener("pointermove", (event) => {
  if (!cropBoxState?.drawing || cropBoxState.pointerId !== event.pointerId || !selectedCover) return;
  const frame = coverPreview.parentElement.getBoundingClientRect();
  const startX = ((cropBoxState.startX - frame.left) / frame.width) * 100;
  const startY = ((cropBoxState.startY - frame.top) / frame.height) * 100;
  const currentX = ((event.clientX - frame.left) / frame.width) * 100;
  const currentY = ((event.clientY - frame.top) / frame.height) * 100;
  const x = Math.max(0, Math.min(startX, currentX));
  const y = Math.max(0, Math.min(startY, currentY));
  const w = Math.min(100 - x, Math.max(8, Math.abs(currentX - startX)));
  const h = Math.min(100 - y, Math.max(8, Math.abs(currentY - startY)));
  selectedCover.box = { x, y, w, h };
  updateCoverPreview();
});

const stopCropDrag = (event) => {
  if (cropBoxState?.pointerId === event.pointerId) {
    if (cropBoxState.drawing) {
      coverPreview.parentElement.releasePointerCapture(event.pointerId);
      cropBox.style.pointerEvents = "";
    } else {
      cropBox.releasePointerCapture(event.pointerId);
    }
    cropBox.classList.remove("is-dragging");
    cropBoxState = null;
  }
};

cropBox.addEventListener("pointerup", stopCropDrag);
cropBox.addEventListener("pointercancel", stopCropDrag);
coverPreview.parentElement.addEventListener("pointerup", stopCropDrag);
coverPreview.parentElement.addEventListener("pointercancel", stopCropDrag);

let draggedThumbIndex = null;

coverThumbs.addEventListener("click", (event) => {
  const item = event.target.closest(".thumb-item");
  if (!item || draggedThumbIndex !== null) return;
  editingCoverIndex = Number(item.dataset.index);
  cropQueue = [sourceCovers[editingCoverIndex] || {
    src: croppedCovers[editingCoverIndex],
    width: 1200,
    height: 675,
    box: { x: 0, y: 0, w: 100, h: 100 },
  }];
  cropIndex = 0;
  openCropAtIndex();
});

coverThumbs.addEventListener("dragstart", (event) => {
  const item = event.target.closest(".thumb-item");
  if (!item) return;
  draggedThumbIndex = Number(item.dataset.index);
  event.dataTransfer.effectAllowed = "move";
});

coverThumbs.addEventListener("dragover", (event) => {
  if (event.target.closest(".thumb-item")) {
    event.preventDefault();
  }
});

coverThumbs.addEventListener("drop", (event) => {
  const item = event.target.closest(".thumb-item");
  if (!item || draggedThumbIndex === null) return;
  event.preventDefault();
  const targetIndex = Number(item.dataset.index);
  const [moved] = croppedCovers.splice(draggedThumbIndex, 1);
  const [movedSource] = sourceCovers.splice(draggedThumbIndex, 1);
  croppedCovers.splice(targetIndex, 0, moved);
  sourceCovers.splice(targetIndex, 0, movedSource);
  draggedThumbIndex = null;
  renderCoverThumbs();
});

coverThumbs.addEventListener("dragend", () => {
  draggedThumbIndex = null;
});

cancelCropButton.addEventListener("click", () => {
  closeCropper();
});

coverCropper.addEventListener("click", (event) => {
  if (event.target === coverCropper) closeCropper();
});

confirmCropButton.addEventListener("click", async () => {
  const cropped = await createCroppedCover();
  if (editingCoverIndex !== null) {
    croppedCovers[editingCoverIndex] = cropped;
    sourceCovers[editingCoverIndex] = selectedCover;
    editingCoverIndex = null;
    cropQueue = [];
    cropIndex = 0;
    closeCropper();
    renderCoverThumbs();
    showToast("截图已更新");
    return;
  }

  croppedCovers.push(cropped);
  sourceCovers.push(selectedCover);
  cropIndex += 1;
  openCropAtIndex();
});

submitForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!croppedCovers.length) {
    showToast("请上传 1-5 张作品截图");
    return;
  }

  const data = new FormData(submitForm);
  const category = data.get("category");
  const newWork = {
    id: `work-${Date.now()}`,
    title: data.get("title").trim(),
    description: data.get("description").trim(),
    url: data.get("url").trim(),
    github: data.get("github").trim(),
    category,
    type: getTypeLabel(category),
    tool: data.get("tool").trim(),
    stack: data.get("github").trim() ? "GitHub" : "Live",
    devices: getSelectedDevices(),
    visual: getVisualClass(works.length),
    cover: croppedCovers[0],
    photos: croppedCovers,
    createdAt: Date.now(),
    views: 0,
    likes: 0,
    isUserCreated: true,
    authorId: getUser().id,
  };

  works = [newWork, ...works];
  saveUserWorks();
  submitForm.reset();
  selectedCover = null;
  cropQueue = [];
  cropIndex = 0;
  croppedCovers = [];
  sourceCovers = [];
  renderCoverThumbs();
  closeCropper();
  activeRank = "latest";
  rankButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.rank === "latest");
  });
  renderWorks();
  closePanel();
  showToast("作品已发布，已进入最新列表");
});

works = [...getStoredWorks().map(normalizeWork), ...seedWorks.map(normalizeWork)];
applyInteractions();
renderWorks();
updateLoginState();
(async () => {
  const oauthResult = new URLSearchParams(window.location.search).get("github_login");
  await ensureBackendProbe();
  await syncServerSession();
  if (getUser()) {
    closeLogin();
    if (oauthResult === "success") {
      pendingProfileAvatar = null;
      renderProfilePanel();
      profileOverlay.classList.add("is-open");
      profileOverlay.setAttribute("aria-hidden", "false");
    }
  }
  handleAuthRedirectMessage();
  bindTilt(document.querySelectorAll(".logo-card, .floating-card, .creator-card"));
})();
