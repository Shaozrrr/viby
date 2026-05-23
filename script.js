const root = document.documentElement;
const panel = document.querySelector(".submit-panel");
const openButtons = document.querySelectorAll("[data-open-submit]");
const closeButton = document.querySelector("[data-close-submit]");
const rankButtons = document.querySelectorAll("[data-rank]");
const heroTitle = document.querySelector("#heroTitle");
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
const pickCoverButton = document.querySelector("[data-pick-cover]");
const coverThumb = document.querySelector("#coverThumb");
const coverThumbs = document.querySelector("#coverThumbs");
const coverCountText = document.querySelector("#coverCountText");
const coverHelperText = document.querySelector("#coverHelperText");
const coverClearButton = document.querySelector("#coverClearButton");

const coverCropper = document.querySelector("#coverCropper");
const coverPreview = document.querySelector("#coverPreview");
const coverFrame = document.querySelector("#cropViewport");
const confirmCropButton = document.querySelector("[data-confirm-crop]");
const cancelCropButtons = document.querySelectorAll("[data-cancel-crop]");
const cropStageLabel = document.querySelector("#cropStageLabel");
const cropCounter = document.querySelector("#cropCounter");
const cropZoom = document.querySelector("#cropZoom");
const cropZoomValue = document.querySelector("#cropZoomValue");
const cropResetButton = document.querySelector("[data-reset-crop]");
const cropRatioGroup = document.querySelector("#cropRatioGroup");

const detailOverlay = document.querySelector(".detail-overlay");
const closeDetailButton = document.querySelector("[data-close-detail]");
const detailCover = document.querySelector("#detailCover");
const detailImage = document.querySelector("#detailImage");
const detailGalleryEmpty = document.querySelector("#detailGalleryEmpty");
const detailGalleryCounter = document.querySelector("#detailGalleryCounter");
const detailGalleryTrack = document.querySelector("#detailGalleryTrack");
const detailNavButtons = document.querySelectorAll("[data-detail-nav]");
const detailType = document.querySelector("#detailType");
const detailTitle = document.querySelector("#detailTitle");
const detailDescription = document.querySelector("#detailDescription");
const detailReleaseShell = document.querySelector("#detailReleaseShell");
const detailReleaseCard = document.querySelector("#detailReleaseCard");
const detailAuthorCard = document.querySelector("#detailAuthorCard");
const detailMeta = document.querySelector("#detailMeta");
const detailLikes = document.querySelector("#detailLikes");
const detailViews = document.querySelector("#detailViews");
const detailDate = document.querySelector("#detailDate");
const detailActions = document.querySelector("#detailActions");

const profileOverlay = document.querySelector(".profile-overlay");
const profileShell = document.querySelector(".profile-shell");
const profileEntryButton = document.querySelector("[data-open-profile]");
const closeProfileButton = document.querySelector("[data-close-profile]");
const profileAvatarInput = document.querySelector("#profileAvatarInput");
const profileAvatarPreview = document.querySelector("#profileAvatarPreview");
const profileDisplayNameInput = document.querySelector("#profileDisplayName");
const profileModeLine = document.querySelector("#profileModeLine");
const profileEmailLine = document.querySelector("#profileEmailLine");
const profileIntroLine = document.querySelector("#profileIntroLine");
const profileFooterNote = document.querySelector("#profileFooterNote");
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
const defaultAvatar = "./logo-source.png";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const safeTrim = (value) => String(value || "").trim();
const escapeHTML = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const slugify = (value) =>
  safeTrim(value)
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");

const encodeSvg = (svg) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

const createAvatarDataUrl = (label, colorA, colorB) => {
  const text = safeTrim(label).slice(0, 2) || "V";
  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${colorA}" />
          <stop offset="100%" stop-color="${colorB}" />
        </linearGradient>
      </defs>
      <rect width="160" height="160" rx="44" fill="url(#g)" />
      <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial, PingFang SC, Microsoft YaHei, sans-serif"
        font-size="56" font-weight="700" fill="white">${text}</text>
    </svg>
  `);
};

const seedAuthors = [
  {
    id: "seed-author-ling",
    name: "玲羽",
    handle: "@lingyu-builds",
    bio: "偏爱把模糊灵感做成能直接打开的小作品。",
    avatar: createAvatarDataUrl("玲羽", "#7553ff", "#ff8a6c"),
  },
  {
    id: "seed-author-mori",
    name: "Mori Lab",
    handle: "@mori-lab",
    bio: "独立开发实验室，专注让工具更轻、更快、更顺手。",
    avatar: createAvatarDataUrl("ML", "#111827", "#2dd4bf"),
  },
  {
    id: "seed-author-zhou",
    name: "周野",
    handle: "@zhouye",
    bio: "喜欢做很小但马上能用的产品切片。",
    avatar: createAvatarDataUrl("周野", "#ef6b5c", "#8b5cf6"),
  },
];

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
    authorIndex: 0,
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
    authorIndex: 1,
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
    authorIndex: 2,
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
    authorIndex: 1,
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
    authorIndex: 0,
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
    authorIndex: 2,
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
    authorIndex: 1,
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
    authorIndex: 0,
  },
].map((work) => {
  const author = seedAuthors[work.authorIndex] || seedAuthors[0];
  return {
    ...work,
    authorId: author.id,
    authorName: author.name,
    authorAvatar: author.avatar,
    authorHandle: author.handle,
    authorBio: author.bio,
  };
});

let works = [];
let activeRank = "latest";
let selectedCover = null;
let cropQueue = [];
let cropIndex = 0;
let croppedCovers = [];
let sourceCovers = [];
let editingCoverIndex = null;
let cropPointerState = null;
let pendingProfileAvatar = null;
let activeDetailWorkId = "";
let activeDetailPhotoIndex = 0;
let activeProfileContext = null;
let activeReleaseExpanded = false;
let activeReleaseEditing = false;

let vibyBackend = {
  checked: false,
  apiOnline: false,
  githubOAuthReady: false,
  problem: null,
};

let backendProbePromise = null;

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

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(authKey));
  } catch {
    return null;
  }
};

const fileToAvatarDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const image = new Image();
      image.addEventListener("load", () => {
        const canvas = document.createElement("canvas");
        const size = 180;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.9));
      });
      image.addEventListener("error", reject);
      image.src = reader.result;
    });
    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });

const formatHandle = (handle, fallbackName = "creator") => {
  const raw = safeTrim(handle);
  if (raw.startsWith("@")) return raw;
  if (raw) return `@${raw}`;
  const slug = slugify(fallbackName) || "creator";
  return `@${slug}`;
};

const getProfilePresentation = (user) => {
  if (!user) {
    return {
      displayName: "",
      avatarUrl: defaultAvatar,
      handle: "@creator",
    };
  }

  const prefs = getProfilePrefs(user.id);
  const displayName = safeTrim(
    prefs.displayName || user.name || (user.email || "").split("@")[0] || "创作者",
  );
  const avatarUrl = safeTrim(prefs.avatarDataUrl || user.avatar) || defaultAvatar;
  const handle = formatHandle((user.email || displayName).split("@")[0], displayName);

  return { displayName, avatarUrl, handle };
};

const buildCurrentUserAuthorSnapshot = (user = getUser()) => {
  if (!user) return null;
  const { displayName, avatarUrl, handle } = getProfilePresentation(user);
  return {
    id: user.id,
    displayName,
    avatarUrl,
    handle,
    bio: "这是我的 Viby 创作者主页，欢迎继续逛我的作品。",
  };
};

const getAuthorSnapshotForWork = (work) => {
  const user = getUser();
  if (user && work.authorId && user.id === work.authorId) {
    const current = buildCurrentUserAuthorSnapshot(user);
    if (current) return current;
  }

  return {
    id: work.authorId || "",
    displayName: safeTrim(work.authorName) || "匿名创作者",
    avatarUrl: safeTrim(work.authorAvatar) || defaultAvatar,
    handle: formatHandle(work.authorHandle, work.authorName),
    bio: safeTrim(work.authorBio) || "这位创作者还没有留下更多介绍。",
  };
};

const getVisualClass = (index) => ["visual-one", "visual-two", "visual-three"][index % 3];

const normalizeWork = (work, index = 0) => {
  if (!work || typeof work !== "object") return null;
  const fallbackAuthor = seedAuthors[index % seedAuthors.length];
  const baseLikes =
    Number.isFinite(work.baseLikes) && work.baseLikes >= 0
      ? work.baseLikes
      : Number.isFinite(work.likes) && work.likes >= 0
        ? work.likes
        : Number.isFinite(work.saves) && work.saves >= 0
          ? work.saves
          : 0;
  const likedBy = Array.isArray(work.likedBy) ? work.likedBy.filter(Boolean) : [];
  const photos = dedupePhotos(
    Array.isArray(work.photos) ? work.photos : work.cover ? [work.cover] : [],
  );
  const releaseNotes = Array.isArray(work.releaseNotes)
    ? work.releaseNotes.map((item) => safeTrim(item)).filter(Boolean)
    : parseReleaseNotes(work.releaseNotes);

  return {
    ...work,
    category: safeTrim(work.category) || "website",
    type: safeTrim(work.type) || (safeTrim(work.category) === "app" ? "App" : "Website"),
    cover: photos[0] || safeTrim(work.cover) || "",
    photos,
    tool: safeTrim(work.tool === "Vibe coding" ? "" : work.tool),
    stack: safeTrim(work.stack) || "",
    linkType: safeTrim(work.linkType).toLowerCase() === "appstore" ? "appstore" : "website",
    versionTag: safeTrim(work.versionTag),
    releaseNotes,
    devices:
      Array.isArray(work.devices) && work.devices.length
        ? work.devices
        : safeTrim(work.category) === "app"
          ? ["手机端", "电脑端"]
          : ["电脑端"],
    createdAt: Number.isFinite(work.createdAt) ? work.createdAt : Date.now() - index * oneDay,
    views: Number.isFinite(work.views) ? work.views : 0,
    baseLikes,
    likedBy,
    likes: baseLikes + likedBy.length,
    visual: safeTrim(work.visual) || getVisualClass(index),
    authorId: safeTrim(work.authorId) || fallbackAuthor.id,
    authorName: safeTrim(work.authorName) || fallbackAuthor.name,
    authorAvatar: safeTrim(work.authorAvatar) || fallbackAuthor.avatar,
    authorHandle: formatHandle(work.authorHandle || fallbackAuthor.handle, work.authorName || fallbackAuthor.name),
    authorBio: safeTrim(work.authorBio) || fallbackAuthor.bio,
    isUserCreated: Boolean(work.isUserCreated),
  };
};

const saveUserWorks = () => {
  localStorage.setItem(
    storageKey,
    JSON.stringify(
      works.filter((work) => work.isUserCreated).map((work, index) =>
        normalizeWork(
          {
            ...work,
            cover: work.photos?.[0] || work.cover || "",
            photos: dedupePhotos(work.photos),
            likes: work.baseLikes + (work.likedBy?.length || 0),
          },
          index,
        ),
      ),
    ),
  );
};

const applyInteractions = () => {
  const interactions = getInteractions();
  works = works.map((work) => {
    const likedBy = Array.isArray(interactions[work.id]?.likedBy)
      ? interactions[work.id].likedBy
      : work.likedBy || [];
    return {
      ...work,
      likedBy,
      likes: (work.baseLikes || 0) + likedBy.length,
    };
  });
};

const syncAuthoredWorksWithProfile = (user = getUser()) => {
  if (!user) return;
  const current = buildCurrentUserAuthorSnapshot(user);
  if (!current) return;

  let changed = false;
  works = works.map((work) => {
    if (!work.isUserCreated || work.authorId !== user.id) return work;

    const next = {
      ...work,
      authorName: current.displayName,
      authorAvatar: current.avatarUrl,
      authorHandle: current.handle,
      authorBio: current.bio,
    };

    if (
      next.authorName !== work.authorName ||
      next.authorAvatar !== work.authorAvatar ||
      next.authorHandle !== work.authorHandle ||
      next.authorBio !== work.authorBio
    ) {
      changed = true;
    }

    return next;
  });

  if (changed) saveUserWorks();
};

const formatNumber = (value) => {
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  return String(value);
};

const formatDate = (timestamp) =>
  new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(timestamp));

const formatDetailDate = (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};

const formatRelativeDate = (timestamp) => {
  const diff = Date.now() - timestamp;
  const days = Math.floor(diff / oneDay);
  if (days <= 0) return "今天发布";
  if (days === 1) return "1 天前";
  if (days < 30) return `${days} 天前`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} 个月前`;
  return `${Math.floor(months / 12)} 年前`;
};

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2200);
};

const blurOverlayFocus = (overlay) => {
  const active = document.activeElement;
  if (active instanceof HTMLElement && overlay?.contains(active)) {
    active.blur();
  }
};

const getTypeLabel = (category) => {
  const c = String(category || "");
  if (c.includes("website")) return "Website";
  if (c.includes("app")) return "App";
  if (c.includes("open")) return "Open source";
  if (c.includes("ai")) return "AI app";
  return "Tool";
};

const getCategoryText = (category) =>
  String(category || "")
    .replace("website", "网站")
    .replace("app", "APP")
    .replace("open", "开源")
    .replace("tool", "小工具")
    .replace("ai", "AI 应用");

const sanitizeMetaLabel = (value) => {
  const text = safeTrim(value);
  if (!text) return "";
  if (text.toLowerCase() === "live") return "";
  if (text.toLowerCase() === "v0") return "";
  return text;
};

const dedupePhotos = (photos) =>
  [...new Set((Array.isArray(photos) ? photos : []).map((item) => safeTrim(item)).filter(Boolean))];

const parseReleaseNotes = (value) =>
  String(value || "")
    .split("\n")
    .map((line) => safeTrim(line.replace(/^[\-\u2022]\s*/, "")))
    .filter(Boolean);

const getPrimaryActionLabel = (work) =>
  safeTrim(work.linkType).toLowerCase() === "appstore" ? "查看 App Store" : "访问作品";

const isOwnWork = (work) => {
  const user = getUser();
  return Boolean(user && work && work.authorId && user.id === work.authorId);
};

const getSelectedDevices = () => {
  const devices = [...submitForm.querySelectorAll('[name="devices"]:checked')].map(
    (input) => input.value,
  );
  return devices.length ? devices : ["电脑端"];
};

const updateStats = () => {
  statWorks.textContent = works.length;
  statViews.textContent = formatNumber(works.reduce((sum, work) => sum + (work.views || 0), 0));
  statLikes.textContent = formatNumber(works.reduce((sum, work) => sum + (work.likes || 0), 0));
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

  const likedBy = Array.isArray(work.likedBy) ? [...work.likedBy] : [];
  if (likedBy.includes(user.id)) {
    showToast("你已经给这个作品点过赞了");
    return false;
  }

  likedBy.push(user.id);
  work.likedBy = likedBy;
  work.likes = (work.baseLikes || 0) + likedBy.length;

  const interactions = getInteractions();
  interactions[id] = { ...(interactions[id] || {}), likedBy };
  saveInteractions(interactions);
  saveUserWorks();
  showToast("已点赞，榜单会实时更新");
  return true;
};

const incrementViews = (id) => {
  const work = works.find((item) => item.id === id);
  if (!work) return;
  work.views += 1;
  saveUserWorks();
  updateStats();
  renderWorks();
  if (activeDetailWorkId === id) {
    detailViews.textContent = formatNumber(work.views);
  }
};

const bindTilt = (cards) => {
  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateX = (y / rect.height - 0.5) * -4;
      const rotateY = (x / rect.width - 0.5) * 4;
      card.style.transform =
        `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
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

const buildCardMetaItems = (work) => {
  const items = [
    (work.devices || ["电脑端"]).join(" / "),
    safeTrim(work.linkType).toLowerCase() === "appstore" ? "App Store" : "",
    work.github ? "GitHub" : "",
    sanitizeMetaLabel(work.tool),
    sanitizeMetaLabel(work.stack),
  ]
    .filter(Boolean)
    .filter((item, index, list) => list.indexOf(item) === index);

  return items.slice(0, 3);
};

const buildDetailMetaItems = (work) => {
  const items = [
    getCategoryText(work.category),
    (work.devices || ["电脑端"]).join(" / "),
    safeTrim(work.linkType).toLowerCase() === "appstore" ? "App Store" : "",
    work.github ? "GitHub" : "",
    sanitizeMetaLabel(work.tool),
    sanitizeMetaLabel(work.stack),
  ]
    .filter(Boolean)
    .filter((item, index, list) => list.indexOf(item) === index);

  return items.slice(0, 5);
};

const renderDetailReleaseCard = (work) => {
  if (!detailReleaseShell || !detailReleaseCard) return;
  const canEdit = isOwnWork(work);
  const hasReleaseContent = Boolean(work.versionTag || work.releaseNotes?.length);

  if (!hasReleaseContent && !canEdit) {
    detailReleaseShell.hidden = true;
    detailReleaseCard.innerHTML = "";
    return;
  }

  detailReleaseShell.hidden = false;

  const currentNotes = work.releaseNotes?.length ? work.releaseNotes : [];
  const currentVersion = work.versionTag || "";

  const triggerLabel = currentVersion || (currentNotes.length ? `${currentNotes.length} 条更新` : "添加版本记录");

  if (activeReleaseEditing && canEdit) {
    detailReleaseCard.innerHTML = `
      <div class="detail-release-trigger-row">
        <button type="button" class="detail-release-trigger is-active" data-release-toggle>
          <span class="detail-release-trigger-kicker">版本迭代</span>
          <strong>${escapeHTML(triggerLabel)}</strong>
        </button>
        <button type="button" class="detail-release-mini" data-release-close>关闭</button>
      </div>
      <div class="detail-release-popover is-open">
        <div class="detail-release-popover-backdrop" data-release-close></div>
        <div class="detail-release-popover-card detail-release-popover-card-edit">
          <div class="detail-release-popover-head">
            <div>
              <span>版本迭代</span>
              <strong>编辑版本记录</strong>
            </div>
            <button type="button" class="detail-release-icon" data-release-close aria-label="关闭">×</button>
          </div>
          <label class="detail-release-field">
            <span>版本号</span>
            <input id="detailReleaseVersionInput" type="text" value="${escapeHTML(currentVersion)}" placeholder="例如 v1.0.3" />
          </label>
          <label class="detail-release-field">
            <span>迭代记录</span>
            <textarea id="detailReleaseNotesInput" rows="5" placeholder="每行一条更新内容">${escapeHTML(
              currentNotes.join("\n"),
            )}</textarea>
          </label>
          <div class="detail-release-actions">
            <button type="button" class="detail-release-edit primary" data-release-save>保存</button>
            <button type="button" class="detail-release-edit ghost" data-release-cancel>取消</button>
          </div>
        </div>
      </div>
    `;
    return;
  }

  detailReleaseCard.innerHTML = `
    <div class="detail-release-trigger-row">
      <button type="button" class="detail-release-trigger ${activeReleaseExpanded ? "is-active" : ""}" data-release-toggle>
        <span class="detail-release-trigger-kicker">版本迭代</span>
        <strong>${escapeHTML(triggerLabel)}</strong>
      </button>
      ${
        canEdit
          ? `<button type="button" class="detail-release-mini" data-release-edit>${hasReleaseContent ? "修改" : "添加"}</button>`
          : ""
      }
    </div>
    ${
      activeReleaseExpanded
        ? `
      <div class="detail-release-popover is-open">
        <div class="detail-release-popover-backdrop" data-release-close></div>
        <div class="detail-release-popover-card">
          <div class="detail-release-popover-head">
            <div>
              <span>版本迭代</span>
              <strong>${escapeHTML(currentVersion || "最近更新")}</strong>
            </div>
            <button type="button" class="detail-release-icon" data-release-close aria-label="关闭">×</button>
          </div>
          <div class="detail-release-panel">
            ${
              currentNotes.length
                ? `<ul>${currentNotes.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>`
                : `<p>这件作品暂时还没有公开版本记录。</p>`
            }
          </div>
        </div>
      </div>
    `
        : ""
    }
  `;
};

const renderWorks = () => {
  const visibleWorks = getRankedWorks().slice(0, 6);
  const rankLabels = ["1", "2", "3"];

  workGrid.innerHTML = visibleWorks
    .map((work, index) => {
      const author = getAuthorSnapshotForWork(work);
      const meta = buildCardMetaItems(work);
      return `
        <article class="work-card" data-id="${work.id}" data-category="${escapeHTML(work.category)}" data-tilt>
          <div class="rank-badge ${index < 3 ? `rank-featured rank-${index + 1}` : ""}">${rankLabels[index] || index + 1}</div>
          <div class="work-visual ${work.cover ? "has-cover" : work.visual}">
            ${work.cover ? `<img src="${work.cover}" alt="${escapeHTML(work.title)} 封面" />` : ""}
          </div>
          <div class="work-content">
            <div class="work-topline">
              <span class="work-type-chip">${escapeHTML(getCategoryText(work.category))}</span>
              <span class="work-date">${escapeHTML(formatRelativeDate(work.createdAt))}</span>
            </div>
            <h3>${escapeHTML(work.title)}</h3>
            <p>${escapeHTML(work.description)}</p>
            <div class="work-meta">
              ${meta.map((item) => `<span>${escapeHTML(item)}</span>`).join("")}
            </div>
            <div class="work-author-row">
              <button type="button" class="author-chip" data-open-author="${work.id}">
                <img class="author-avatar" src="${author.avatarUrl}" alt="${escapeHTML(author.displayName)}" />
                <span class="author-copy">
                  <strong>${escapeHTML(author.displayName)}</strong>
                  <small>${escapeHTML(author.handle)}</small>
                </span>
              </button>
              <div class="work-stats-inline">
                <span>${formatNumber(work.views)} 浏览</span>
                <span>${formatNumber(work.likes)} 赞</span>
              </div>
            </div>
            <div class="work-actions">
              <a href="${work.url}" target="_blank" rel="noreferrer" data-visit="${work.id}">${getPrimaryActionLabel(work)}</a>
              ${work.github ? `<a href="${work.github}" target="_blank" rel="noreferrer">GitHub</a>` : ""}
              <button type="button" data-like="${work.id}">点赞 ${formatNumber(work.likes)}</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  bindTilt(workGrid.querySelectorAll("[data-tilt]"));
  updateStats();
};

const updateLoginState = () => {
  const user = getUser();
  if (user) {
    syncAuthoredWorksWithProfile(user);
    openLoginButton.hidden = true;
    profileEntryButton.hidden = false;
    const { displayName, avatarUrl } = getProfilePresentation(user);
    const avatarEl = profileEntryButton.querySelector(".profile-entry-avatar");
    const labelEl = profileEntryButton.querySelector(".profile-entry-label");
    if (avatarEl) {
      avatarEl.src = avatarUrl || defaultAvatar;
      avatarEl.alt = displayName;
    }
    if (labelEl) labelEl.textContent = displayName;
  } else {
    openLoginButton.hidden = false;
    profileEntryButton.hidden = true;
  }
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
  blurOverlayFocus(panel);
  panel.classList.remove("is-open");
  panel.setAttribute("aria-hidden", "true");
};

const openCropper = () => {
  coverCropper.classList.add("is-open");
  coverCropper.setAttribute("aria-hidden", "false");
};

const closeCropper = () => {
  blurOverlayFocus(coverCropper);
  coverCropper.classList.remove("is-open");
  coverCropper.setAttribute("aria-hidden", "true");
  cropPointerState = null;
};

const openLogin = () => {
  loginOverlay.classList.add("is-open");
  loginOverlay.setAttribute("aria-hidden", "false");
};

const closeLogin = () => {
  blurOverlayFocus(loginOverlay);
  loginOverlay.classList.remove("is-open");
  loginOverlay.setAttribute("aria-hidden", "true");
};

const renderDetailGallery = () => {
  const work = works.find((item) => item.id === activeDetailWorkId);
  if (!work) return;

  const photos = work.photos?.length ? work.photos : work.cover ? [work.cover] : [];
  const hasPhotos = photos.length > 0;

  detailCover.classList.toggle("is-empty", !hasPhotos);
  detailImage.hidden = !hasPhotos;
  detailGalleryEmpty.hidden = hasPhotos;

  if (!hasPhotos) {
    detailGalleryCounter.textContent = "0 / 0";
    detailGalleryTrack.innerHTML = "";
  } else {
    activeDetailPhotoIndex = clamp(activeDetailPhotoIndex, 0, photos.length - 1);
    detailImage.src = photos[activeDetailPhotoIndex];
    detailImage.alt = `${work.title} 截图 ${activeDetailPhotoIndex + 1}`;
    detailGalleryCounter.textContent = `${activeDetailPhotoIndex + 1} / ${photos.length}`;
    detailGalleryTrack.innerHTML = photos
      .map(
        (photo, index) => `
          <button
            type="button"
            class="detail-gallery-thumb ${index === activeDetailPhotoIndex ? "is-active" : ""}"
            data-detail-thumb="${index}"
            aria-label="查看第 ${index + 1} 张图"
          >
            <img src="${photo}" alt="" />
          </button>
        `,
      )
      .join("");
  }

  detailNavButtons.forEach((button) => {
    button.disabled = photos.length < 2;
  });
};

const openDetail = (id, options = {}) => {
  const work = works.find((item) => item.id === id);
  if (!work) return;

  activeDetailWorkId = work.id;
  activeDetailPhotoIndex = clamp(options.photoIndex ?? 0, 0, Math.max(0, (work.photos?.length || 1) - 1));
  activeReleaseExpanded = false;
  activeReleaseEditing = false;

  const author = getAuthorSnapshotForWork(work);
  detailType.textContent = work.type;
  detailTitle.textContent = work.title;
  detailDescription.textContent = work.description;
  renderDetailReleaseCard(work);
  detailAuthorCard.innerHTML = `
    <button type="button" class="detail-author-button" data-open-author="${work.id}">
      <img class="author-avatar" src="${author.avatarUrl}" alt="${escapeHTML(author.displayName)}" />
      <span class="author-copy">
        <strong>${escapeHTML(author.displayName)}</strong>
        <small>${escapeHTML(author.handle)} · 点击进入主页</small>
      </span>
    </button>
  `;
  detailMeta.innerHTML = buildDetailMetaItems(work)
    .map((item) => `<span>${escapeHTML(item)}</span>`)
    .join("");
  detailLikes.textContent = formatNumber(work.likes);
  detailViews.textContent = formatNumber(work.views);
  detailDate.textContent = formatDetailDate(work.createdAt);
  detailActions.innerHTML = `
    <a href="${work.url}" target="_blank" rel="noreferrer" data-visit="${work.id}">${getPrimaryActionLabel(work)}</a>
    ${work.github ? `<a href="${work.github}" target="_blank" rel="noreferrer">GitHub</a>` : ""}
    <button type="button" data-like="${work.id}">点赞 ${formatNumber(work.likes)}</button>
    ${isOwnWork(work) ? `<button type="button" class="danger-link" data-delete-work="${work.id}">删除作品</button>` : ""}
  `;

  renderDetailGallery();
  detailOverlay.classList.add("is-open");
  detailOverlay.setAttribute("aria-hidden", "false");
};

const closeDetail = () => {
  blurOverlayFocus(detailOverlay);
  detailOverlay.classList.remove("is-open");
  detailOverlay.setAttribute("aria-hidden", "true");
  activeDetailWorkId = "";
  activeDetailPhotoIndex = 0;
  activeReleaseExpanded = false;
  activeReleaseEditing = false;
};

const stepDetailGallery = (direction) => {
  const work = works.find((item) => item.id === activeDetailWorkId);
  if (!work) return;
  const photos = work.photos?.length ? work.photos : work.cover ? [work.cover] : [];
  if (photos.length < 2) return;
  activeDetailPhotoIndex = (activeDetailPhotoIndex + direction + photos.length) % photos.length;
  renderDetailGallery();
};

const deleteWork = (id) => {
  const work = works.find((item) => item.id === id);
  if (!work || !isOwnWork(work)) return;
  const confirmed = window.confirm(`确定删除《${work.title}》吗？删除后将无法恢复。`);
  if (!confirmed) return;

  works = works.filter((item) => item.id !== id);
  saveUserWorks();
  updateStats();
  renderWorks();

  if (activeProfileContext) {
    activeProfileContext = buildProfileContext({ work });
    if (activeProfileContext) renderProfilePanel();
  }

  closeDetail();
  showToast("作品已删除");
};

const saveReleaseForWork = (id, versionTag, releaseNotes) => {
  const work = works.find((item) => item.id === id);
  if (!work || !isOwnWork(work)) return false;
  work.versionTag = safeTrim(versionTag);
  work.releaseNotes = parseReleaseNotes(releaseNotes);
  saveUserWorks();
  return true;
};

const getWorksByAuthor = (context) => {
  if (!context) return [];
  return works
    .filter((work) => {
      if (context.id && work.authorId === context.id) return true;
      if (!context.id && context.handle && work.authorHandle === context.handle) return true;
      return work.authorName === context.displayName;
    })
    .sort((a, b) => b.createdAt - a.createdAt);
};

const buildProfileContext = ({ work } = {}) => {
  const currentUser = getUser();
  if (work) {
    const author = getAuthorSnapshotForWork(work);
    const editable = Boolean(currentUser && work.authorId && currentUser.id === work.authorId);
    return {
      ...author,
      email: editable ? currentUser.email || "" : author.handle,
      intro: editable
        ? "这里会沉淀你的全部作品。别人点你的头像时，也会看到这个页面。"
        : author.bio,
      footerNote: editable
        ? "改完资料会同步到你发布的作品卡片和详情页，也可以在作品详情里删除自己的作品。"
        : "这个主页只读，重点是让访客继续逛这位创作者的作品。",
      editable,
      works: getWorksByAuthor(author),
    };
  }

  if (!currentUser) return null;
  const author = buildCurrentUserAuthorSnapshot(currentUser);
  return {
    ...author,
    email: currentUser.email || "",
    intro: "这里会沉淀你的全部作品。别人点你的头像时，也会看到这个页面。",
    footerNote: "改完资料会同步到你发布的作品卡片和详情页，也可以在作品详情里删除自己的作品。",
    editable: true,
    works: works
      .filter((item) => item.isUserCreated && item.authorId === currentUser.id)
      .sort((a, b) => b.createdAt - a.createdAt),
  };
};

const renderProfilePanel = () => {
  if (!activeProfileContext || !profileWorksGrid) return;

  const context = activeProfileContext;
  const list = context.works || [];
  const viewsSum = list.reduce((sum, work) => sum + (work.views || 0), 0);
  const likesSum = list.reduce((sum, work) => sum + (work.likes || 0), 0);

  profileShell.classList.toggle("is-readonly", !context.editable);
  profileDisplayNameInput.value = context.displayName;
  profileDisplayNameInput.readOnly = !context.editable;
  profileAvatarInput.disabled = !context.editable;
  profileResetAvatarButton.hidden = !context.editable;
  profileSaveButton.hidden = !context.editable;
  profileLogoutButton.hidden = !context.editable;
  profileModeLine.textContent = context.editable ? "我的主页" : "创作者";
  profileEmailLine.textContent = context.editable ? context.email : context.handle;
  profileIntroLine.textContent = context.intro;
  profileFooterNote.textContent = context.footerNote;
  profileAvatarPreview.src = pendingProfileAvatar || context.avatarUrl || defaultAvatar;
  profileAvatarPreview.alt = context.displayName;

  profileStatWorksEl.textContent = list.length;
  profileStatViewsEl.textContent = formatNumber(viewsSum);
  profileStatLikesEl.textContent = formatNumber(likesSum);

  profileWorksGrid.innerHTML = list.length
    ? list
        .map((work) => `
          <button type="button" class="profile-work-tile" data-open-work="${work.id}">
            <div class="profile-work-tile-visual ${work.cover ? "has-cover" : work.visual}">
              ${work.cover ? `<img src="${work.cover}" alt="" />` : ""}
            </div>
            <div class="profile-work-tile-body">
              <p class="profile-work-tile-title">${escapeHTML(work.title)}</p>
              <div class="profile-work-tile-meta">
                <span>${formatNumber(work.views)} 浏览</span>
                <span>${formatNumber(work.likes)} 赞</span>
                <span>${Math.max(work.photos?.length || 0, work.cover ? 1 : 0)} 张图</span>
              </div>
            </div>
          </button>
        `)
        .join("")
    : `<div class="profile-empty">还没有作品。去发布一条，它会出现在这里。</div>`;
};

const closeProfile = () => {
  blurOverlayFocus(profileOverlay);
  profileOverlay.classList.remove("is-open");
  profileOverlay.setAttribute("aria-hidden", "true");
  activeProfileContext = null;
  pendingProfileAvatar = null;
};

const openProfile = async (options = {}) => {
  const { fromLoginNav = false, workId = "" } = options;

  if (workId) {
    const work = works.find((item) => item.id === workId);
    if (!work) return;
    activeProfileContext = buildProfileContext({ work });
    pendingProfileAvatar = null;
    renderProfilePanel();
    profileOverlay.classList.add("is-open");
    profileOverlay.setAttribute("aria-hidden", "false");
    return;
  }

  await syncServerSession();
  if (!getUser()) {
    openLogin();
    if (!fromLoginNav) showToast("需要先登录才能打开个人主页");
    return;
  }

  closeLogin();
  activeProfileContext = buildProfileContext();
  pendingProfileAvatar = null;
  renderProfilePanel();
  profileOverlay.classList.add("is-open");
  profileOverlay.setAttribute("aria-hidden", "false");
};

const readDocumentCookie = (name) => {
  const needle = `; ${name}=`;
  const all = `; ${document.cookie}`;
  const index = all.indexOf(needle);
  if (index === -1) return "";
  const start = index + needle.length;
  const end = all.indexOf("; ", start);
  const chunk = end === -1 ? all.slice(start) : all.slice(start, end);
  try {
    return decodeURIComponent(chunk) || "";
  } catch {
    return chunk;
  }
};

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

    if (!response.ok || !data.user) return null;

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
    showToast(
      "GitHub 未就绪：在项目根目录创建 .env，写入 GITHUB_CLIENT_ID 与 GITHUB_CLIENT_SECRET，保存后重新执行 npm start",
    );
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
          aspectMode: "free",
          scale: 1,
          minScale: 1,
          maxScale: 3,
          offsetX: 0,
          offsetY: 0,
        });
      });
      image.addEventListener("error", reject);
      image.src = reader.result;
    });
    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });

const getCropFrameSize = () => ({
  width: Math.max(coverFrame.clientWidth, 1),
  height: Math.max(coverFrame.clientHeight, 1),
});

const getCropAspectValue = (cover) => {
  const mode = safeTrim(cover?.aspectMode) || "free";
  if (mode === "landscape") return "16 / 9";
  if (mode === "portrait") return "4 / 5";
  if (mode === "square") return "1 / 1";
  const width = Math.max(Number(cover?.width) || 1, 1);
  const height = Math.max(Number(cover?.height) || 1, 1);
  return `${width} / ${height}`;
};

const updateCropAspect = () => {
  if (!selectedCover) return;
  const aspectValue = getCropAspectValue(selectedCover);
  coverFrame.style.aspectRatio = aspectValue;
  cropRatioGroup?.querySelectorAll("[data-crop-ratio]").forEach((button) => {
    button.classList.toggle(
      "is-active",
      button.dataset.cropRatio === (safeTrim(selectedCover.aspectMode) || "free"),
    );
  });
};

const centerSelectedCover = () => {
  if (!selectedCover) return;
  const frame = getCropFrameSize();
  const scaledWidth = selectedCover.width * selectedCover.scale;
  const scaledHeight = selectedCover.height * selectedCover.scale;
  selectedCover.offsetX = (frame.width - scaledWidth) / 2;
  selectedCover.offsetY = (frame.height - scaledHeight) / 2;
};

const clampSelectedCover = () => {
  if (!selectedCover) return;
  const frame = getCropFrameSize();
  const scaledWidth = selectedCover.width * selectedCover.scale;
  const scaledHeight = selectedCover.height * selectedCover.scale;

  if (scaledWidth <= frame.width) {
    selectedCover.offsetX = (frame.width - scaledWidth) / 2;
  } else {
    selectedCover.offsetX = clamp(selectedCover.offsetX, frame.width - scaledWidth, 0);
  }

  if (scaledHeight <= frame.height) {
    selectedCover.offsetY = (frame.height - scaledHeight) / 2;
  } else {
    selectedCover.offsetY = clamp(selectedCover.offsetY, frame.height - scaledHeight, 0);
  }
};

const syncCropZoomUi = () => {
  if (!selectedCover) return;
  const maxPercent = Math.max(160, Math.round((selectedCover.maxScale / selectedCover.minScale) * 100));
  cropZoom.max = String(maxPercent);
  cropZoom.value = String(Math.round((selectedCover.scale / selectedCover.minScale) * 100));
  cropZoomValue.textContent = `${cropZoom.value}%`;
};

const updateCropTransform = () => {
  if (!selectedCover) return;
  updateCropAspect();
  coverPreview.style.width = `${selectedCover.width}px`;
  coverPreview.style.height = `${selectedCover.height}px`;
  coverPreview.style.transformOrigin = "top left";
  coverPreview.style.transform = `translate(${selectedCover.offsetX}px, ${selectedCover.offsetY}px) scale(${selectedCover.scale})`;
  syncCropZoomUi();
};

const ensureCropMetrics = (resetPosition = false) => {
  if (!selectedCover) return;
  updateCropAspect();
  const frame = getCropFrameSize();
  const nextMinScale = Math.max(frame.width / selectedCover.width, frame.height / selectedCover.height);
  const prevMinScale = selectedCover.minScale || nextMinScale;
  const ratio = selectedCover.scale ? selectedCover.scale / prevMinScale : 1.06;
  selectedCover.minScale = nextMinScale;
  selectedCover.maxScale = nextMinScale * 3.2;
  selectedCover.scale = clamp(nextMinScale * ratio, nextMinScale, selectedCover.maxScale);
  if (resetPosition || !Number.isFinite(selectedCover.offsetX) || !Number.isFinite(selectedCover.offsetY)) {
    centerSelectedCover();
  }
  clampSelectedCover();
  updateCropTransform();
};

const zoomSelectedCover = (nextScale, clientX, clientY) => {
  if (!selectedCover) return;
  const frameRect = coverFrame.getBoundingClientRect();
  const anchorX = clientX ?? frameRect.left + frameRect.width / 2;
  const anchorY = clientY ?? frameRect.top + frameRect.height / 2;
  const previousScale = selectedCover.scale;
  const localX = anchorX - frameRect.left;
  const localY = anchorY - frameRect.top;
  const imageX = (localX - selectedCover.offsetX) / previousScale;
  const imageY = (localY - selectedCover.offsetY) / previousScale;

  selectedCover.scale = clamp(nextScale, selectedCover.minScale, selectedCover.maxScale);
  selectedCover.offsetX = localX - imageX * selectedCover.scale;
  selectedCover.offsetY = localY - imageY * selectedCover.scale;
  clampSelectedCover();
  updateCropTransform();
};

const renderCoverThumbs = () => {
  const count = croppedCovers.length;
  coverCountText.textContent = count ? `已上传 ${count} / 5 张截图` : "还没上传截图";
  coverHelperText.textContent = count
    ? "点击“重裁”可以重新调整取景；点“设为首图”只会把它挪到第一张，不会复制出额外图片。"
    : "建议第一张放最能代表作品的页面，最多 5 张，别人看详情时会按顺序浏览。";
  coverClearButton.hidden = count === 0;

  if (count) {
    coverThumb.src = croppedCovers[0];
    coverThumb.hidden = false;
    pickCoverButton.classList.add("has-image");
  } else {
    coverThumb.hidden = true;
    coverThumb.removeAttribute("src");
    pickCoverButton.classList.remove("has-image");
  }

  coverThumbs.innerHTML = croppedCovers
    .map(
      (src, index) => `
        <div class="thumb-card ${index === 0 ? "is-cover" : ""}">
          <button class="thumb-preview" type="button" data-thumb-edit="${index}">
            <img src="${src}" alt="作品截图 ${index + 1}" />
            <span class="thumb-badge">${index === 0 ? "首图" : `图 ${index + 1}`}</span>
          </button>
          <div class="thumb-meta">
            <span>${index === 0 ? "默认首图" : `详情第 ${index + 1} 张`}</span>
            <div class="thumb-mini-actions">
              <button class="thumb-action" type="button" data-thumb-edit="${index}">重裁</button>
              ${
                index === 0
                  ? `<button class="thumb-action is-current" type="button" disabled>当前首图</button>`
                  : `<button class="thumb-action" type="button" data-thumb-cover="${index}">设为首图</button>`
              }
              <button class="thumb-action destructive" type="button" data-thumb-remove="${index}">删除</button>
            </div>
          </div>
        </div>
      `,
    )
    .join("");
};

const openCropAtIndex = () => {
  selectedCover = cropQueue[cropIndex];
  if (!selectedCover) {
    editingCoverIndex = null;
    closeCropper();
    renderCoverThumbs();
    showToast(`${croppedCovers.length} 张截图已准备好`);
    return;
  }

  selectedCover.aspectMode = safeTrim(selectedCover.aspectMode) || "free";
  coverPreview.src = selectedCover.src;
  cropStageLabel.textContent = editingCoverIndex !== null ? "重新裁剪" : "截图裁剪";
  cropCounter.textContent =
    editingCoverIndex !== null
      ? `编辑第 ${editingCoverIndex + 1} 张`
      : `${cropIndex + 1} / ${cropQueue.length}`;
  confirmCropButton.textContent =
    editingCoverIndex !== null ? "保存这张截图" : `确认这一张 ${cropIndex + 1}/${cropQueue.length}`;
  openCropper();
  requestAnimationFrame(() => {
    ensureCropMetrics(true);
  });
};

const cancelCropSession = (notify = true) => {
  cropQueue = [];
  cropIndex = 0;
  editingCoverIndex = null;
  selectedCover = null;
  closeCropper();
  if (notify) showToast("已退出裁剪，之前保存的截图会继续保留");
};

const createCroppedCover = async () => {
  if (!selectedCover) return "";
  const image = new Image();
  image.src = selectedCover.src;
  await image.decode();

  const frame = getCropFrameSize();
  const scale = selectedCover.scale;
  const sx = clamp((-selectedCover.offsetX) / scale, 0, image.width);
  const sy = clamp((-selectedCover.offsetY) / scale, 0, image.height);
  const sw = clamp(frame.width / scale, 1, image.width - sx);
  const sh = clamp(frame.height / scale, 1, image.height - sy);
  const aspectRatio = Math.max(sw / sh, 0.2);

  const canvas = document.createElement("canvas");
  if (aspectRatio >= 1) {
    canvas.width = 1600;
    canvas.height = Math.max(480, Math.round(canvas.width / aspectRatio));
  } else {
    canvas.height = 1600;
    canvas.width = Math.max(640, Math.round(canvas.height * aspectRatio));
  }
  const context = canvas.getContext("2d");
  context.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.9);
};

window.addEventListener("pointermove", (event) => {
  root.style.setProperty("--spot-x", `${event.clientX}px`);
  root.style.setProperty("--spot-y", `${event.clientY}px`);
  if (heroTitle) {
    const rect = heroTitle.getBoundingClientRect();
    const relativeX = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
    const relativeY = clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100);
    heroTitle.style.setProperty("--hero-glow-x", `${relativeX}%`);
    heroTitle.style.setProperty("--hero-glow-y", `${relativeY}%`);
  }
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
  const email = safeTrim(new FormData(loginForm).get("email")).toLowerCase();
  if (!email) {
    showToast("先填写邮箱");
    return;
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  localStorage.setItem(
    emailCodeKey,
    JSON.stringify({ email, code, expiresAt: Date.now() + 10 * 60 * 1000 }),
  );
  showToast(`验证码已发送：${code}`);
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(loginForm);
  const email = safeTrim(data.get("email")).toLowerCase();
  const code = safeTrim(data.get("code"));
  if (!email || !code) return;

  const storedCode = JSON.parse(localStorage.getItem(emailCodeKey) || "{}");
  if (storedCode.email !== email || storedCode.code !== code || storedCode.expiresAt < Date.now()) {
    showToast("验证码不正确或已过期");
    return;
  }

  const accounts = getAccounts();
  let account = accounts.find((item) => item.email === email);
  if (!account) {
    account = { id: `user-${Date.now()}`, email, createdAt: Date.now() };
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
    showToast(
      "当前页面不是由 Viby 启动的服务（常见：用了 python -m http.server）。请在项目目录执行 npm start 后再点 GitHub 登录",
    );
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

profileWorksGrid.addEventListener("click", (event) => {
  const tile = event.target.closest("[data-open-work]");
  if (!tile) return;
  closeProfile();
  openDetail(tile.dataset.openWork);
});

profileSaveButton.addEventListener("click", () => {
  const user = getUser();
  if (!user) return;
  const name = safeTrim(profileDisplayNameInput.value);
  if (!name) {
    showToast("请填写展示名称");
    return;
  }

  const patch = { displayName: name };
  if (pendingProfileAvatar) patch.avatarDataUrl = pendingProfileAvatar;
  setProfilePrefs(user.id, patch);
  pendingProfileAvatar = null;
  syncAuthoredWorksWithProfile(user);
  updateLoginState();
  activeProfileContext = buildProfileContext();
  renderProfilePanel();
  renderWorks();
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
  syncAuthoredWorksWithProfile(user);
  updateLoginState();
  activeProfileContext = buildProfileContext();
  renderProfilePanel();
  renderWorks();
  showToast("已恢复默认头像");
});

profileLogoutButton.addEventListener("click", async () => {
  try {
    await fetch("/api/logout", { method: "POST", credentials: "include", cache: "no-store" });
  } catch {
    /* 网络异常时仍清理本地态 */
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

detailNavButtons.forEach((button) => {
  button.addEventListener("click", () => {
    stepDetailGallery(button.dataset.detailNav === "next" ? 1 : -1);
  });
});

detailGalleryTrack.addEventListener("click", (event) => {
  const thumb = event.target.closest("[data-detail-thumb]");
  if (!thumb) return;
  activeDetailPhotoIndex = Number(thumb.dataset.detailThumb);
  renderDetailGallery();
});

detailAuthorCard.addEventListener("click", (event) => {
  const button = event.target.closest("[data-open-author]");
  if (!button) return;
  closeDetail();
  void openProfile({ workId: button.dataset.openAuthor });
});

detailActions.addEventListener("click", (event) => {
  const visitLink = event.target.closest("[data-visit]");
  const likeButton = event.target.closest("[data-like]");
  const deleteButton = event.target.closest("[data-delete-work]");

  if (visitLink) {
    incrementViews(visitLink.dataset.visit);
    return;
  }

  if (likeButton && likeWork(likeButton.dataset.like)) {
    openDetail(likeButton.dataset.like, { photoIndex: activeDetailPhotoIndex });
    renderWorks();
  }

  if (deleteButton) {
    deleteWork(deleteButton.dataset.deleteWork);
  }
});

detailReleaseCard?.addEventListener("click", (event) => {
  const work = works.find((item) => item.id === activeDetailWorkId);
  if (!work) return;

  const toggleButton = event.target.closest("[data-release-toggle]");
  const editButton = event.target.closest("[data-release-edit]");
  const cancelButton = event.target.closest("[data-release-cancel]");
  const saveButton = event.target.closest("[data-release-save]");
  const closeButton = event.target.closest("[data-release-close]");

  if (toggleButton) {
    activeReleaseExpanded = !activeReleaseExpanded;
    activeReleaseEditing = false;
    renderDetailReleaseCard(work);
    return;
  }

  if (editButton && isOwnWork(work)) {
    activeReleaseEditing = true;
    activeReleaseExpanded = true;
    renderDetailReleaseCard(work);
    return;
  }

  if (cancelButton) {
    activeReleaseEditing = false;
    renderDetailReleaseCard(work);
    return;
  }

  if (closeButton) {
    activeReleaseExpanded = false;
    activeReleaseEditing = false;
    renderDetailReleaseCard(work);
    return;
  }

  if (saveButton && isOwnWork(work)) {
    const versionInput = detailReleaseCard.querySelector("#detailReleaseVersionInput");
    const notesInput = detailReleaseCard.querySelector("#detailReleaseNotesInput");
    const saved = saveReleaseForWork(
      work.id,
      versionInput?.value || "",
      notesInput?.value || "",
    );
    if (!saved) return;
    activeReleaseEditing = false;
    activeReleaseExpanded = true;
    renderDetailReleaseCard(work);
    showToast("版本记录已更新");
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
  const authorButton = event.target.closest("[data-open-author]");
  const card = event.target.closest(".work-card");

  if (visitLink) {
    incrementViews(visitLink.dataset.visit);
    return;
  }

  if (likeButton) {
    if (likeWork(likeButton.dataset.like)) renderWorks();
    return;
  }

  if (authorButton) {
    void openProfile({ workId: authorButton.dataset.openAuthor });
    return;
  }

  if (card) openDetail(card.dataset.id);
});

coverInput.addEventListener("change", async () => {
  const remainingSlots = 5 - croppedCovers.length;
  if (remainingSlots <= 0) {
    showToast("最多上传 5 张照片");
    coverInput.value = "";
    return;
  }

  const files = [...(coverInput.files || [])].slice(0, remainingSlots);
  if (!files.length) return;

  if ((coverInput.files || []).length > remainingSlots) {
    showToast(`还可以上传 ${remainingSlots} 张，已自动截取`);
  }

  try {
    cropQueue = await Promise.all(files.map(readImageFile));
    cropIndex = 0;
    editingCoverIndex = null;
    coverInput.value = "";
    openCropAtIndex();
  } catch {
    showToast("图片读取失败，请换一张试试");
  }
});

coverClearButton.addEventListener("click", () => {
  croppedCovers = [];
  sourceCovers = [];
  cropQueue = [];
  cropIndex = 0;
  editingCoverIndex = null;
  selectedCover = null;
  renderCoverThumbs();
  showToast("已清空截图");
});

coverThumbs.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-thumb-edit]");
  const coverButton = event.target.closest("[data-thumb-cover]");
  const removeButton = event.target.closest("[data-thumb-remove]");

  if (editButton) {
    editingCoverIndex = Number(editButton.dataset.thumbEdit);
    const source = sourceCovers[editingCoverIndex];
    cropQueue = [
      source
        ? { ...source }
        : {
            src: croppedCovers[editingCoverIndex],
            width: 1600,
            height: 900,
            aspectMode: "free",
            scale: 1,
            minScale: 1,
            maxScale: 3,
            offsetX: 0,
            offsetY: 0,
          },
    ];
    cropIndex = 0;
    openCropAtIndex();
    return;
  }

  if (coverButton) {
    const targetIndex = Number(coverButton.dataset.thumbCover);
    const [nextCover] = croppedCovers.splice(targetIndex, 1);
    const [nextSource] = sourceCovers.splice(targetIndex, 1);
    croppedCovers.unshift(nextCover);
    sourceCovers.unshift(nextSource);
    renderCoverThumbs();
    showToast("已设为首图");
    return;
  }

  if (removeButton) {
    const targetIndex = Number(removeButton.dataset.thumbRemove);
    croppedCovers.splice(targetIndex, 1);
    sourceCovers.splice(targetIndex, 1);
    renderCoverThumbs();
    showToast("已删除这张截图");
  }
});

coverFrame.addEventListener("pointerdown", (event) => {
  if (!selectedCover) return;
  event.preventDefault();
  cropPointerState = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    offsetX: selectedCover.offsetX,
    offsetY: selectedCover.offsetY,
  };
  coverFrame.setPointerCapture(event.pointerId);
  coverFrame.classList.add("is-dragging");
});

coverFrame.addEventListener("pointermove", (event) => {
  if (!selectedCover || !cropPointerState || cropPointerState.pointerId !== event.pointerId) return;
  const dx = event.clientX - cropPointerState.startX;
  const dy = event.clientY - cropPointerState.startY;
  selectedCover.offsetX = cropPointerState.offsetX + dx;
  selectedCover.offsetY = cropPointerState.offsetY + dy;
  clampSelectedCover();
  updateCropTransform();
});

const stopCropPointer = (event) => {
  if (!cropPointerState || cropPointerState.pointerId !== event.pointerId) return;
  coverFrame.releasePointerCapture(event.pointerId);
  coverFrame.classList.remove("is-dragging");
  cropPointerState = null;
};

coverFrame.addEventListener("pointerup", stopCropPointer);
coverFrame.addEventListener("pointercancel", stopCropPointer);

coverFrame.addEventListener(
  "wheel",
  (event) => {
    if (!selectedCover) return;
    event.preventDefault();
    const direction = event.deltaY > 0 ? -0.06 : 0.06;
    zoomSelectedCover(selectedCover.scale * (1 + direction), event.clientX, event.clientY);
  },
  { passive: false },
);

cropZoom.addEventListener("input", () => {
  if (!selectedCover) return;
  const ratio = Number(cropZoom.value) / 100;
  zoomSelectedCover(selectedCover.minScale * ratio);
});

cropResetButton.addEventListener("click", () => {
  if (!selectedCover) return;
  selectedCover.scale = selectedCover.minScale * 1.06;
  centerSelectedCover();
  clampSelectedCover();
  updateCropTransform();
});

cropRatioGroup?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-crop-ratio]");
  if (!button || !selectedCover) return;
  const nextMode = safeTrim(button.dataset.cropRatio) || "free";
  if (nextMode === selectedCover.aspectMode) return;
  selectedCover.aspectMode = nextMode;
  ensureCropMetrics(true);
});

cancelCropButtons.forEach((button) => {
  button.addEventListener("click", () => cancelCropSession());
});

coverCropper.addEventListener("click", (event) => {
  if (event.target === coverCropper) cancelCropSession();
});

confirmCropButton.addEventListener("click", async () => {
  const cropped = await createCroppedCover();
  if (!cropped) return;

  if (editingCoverIndex !== null) {
    croppedCovers[editingCoverIndex] = cropped;
    sourceCovers[editingCoverIndex] = { ...selectedCover };
    editingCoverIndex = null;
    cropQueue = [];
    cropIndex = 0;
    selectedCover = null;
    closeCropper();
    renderCoverThumbs();
    showToast("截图已更新");
    return;
  }

  croppedCovers.push(cropped);
  sourceCovers.push({ ...selectedCover });
  cropIndex += 1;
  openCropAtIndex();
});

submitForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!croppedCovers.length) {
    showToast("请上传 1-5 张作品截图");
    return;
  }

  const user = getUser();
  if (!user) {
    openLogin();
    showToast("请先登录后再发布作品");
    return;
  }

  const author = buildCurrentUserAuthorSnapshot(user);
  const data = new FormData(submitForm);
  const category = safeTrim(data.get("category"));
  const stack = safeTrim(data.get("stack"));
  const releaseNotes = parseReleaseNotes(data.get("releaseNotes"));

  const newWork = normalizeWork(
    {
      id: `work-${Date.now()}`,
      title: safeTrim(data.get("title")),
      description: safeTrim(data.get("description")),
      url: safeTrim(data.get("url")),
      github: safeTrim(data.get("github")),
      category,
      type: getTypeLabel(category),
      linkType: safeTrim(data.get("linkType")),
      tool: safeTrim(data.get("tool")),
      stack,
      versionTag: safeTrim(data.get("versionTag")),
      releaseNotes,
      devices: getSelectedDevices(),
      visual: getVisualClass(works.length),
      cover: croppedCovers[0],
      photos: dedupePhotos(croppedCovers),
      createdAt: Date.now(),
      views: 0,
      likes: 0,
      baseLikes: 0,
      likedBy: [],
      isUserCreated: true,
      authorId: author.id,
      authorName: author.displayName,
      authorAvatar: author.avatarUrl,
      authorHandle: author.handle,
      authorBio: author.bio,
    },
    works.length,
  );

  works = [newWork, ...works];
  saveUserWorks();
  submitForm.reset();
  croppedCovers = [];
  sourceCovers = [];
  cropQueue = [];
  cropIndex = 0;
  selectedCover = null;
  editingCoverIndex = null;
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

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePanel();
    closeDetail();
    cancelCropSession(false);
    closeLogin();
    closeProfile();
  }

  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    void openPanel();
  }

  if (detailOverlay.classList.contains("is-open")) {
    if (event.key === "ArrowRight") {
      stepDetailGallery(1);
    } else if (event.key === "ArrowLeft") {
      stepDetailGallery(-1);
    }
  }
});

window.addEventListener("resize", () => {
  if (coverCropper.classList.contains("is-open") && selectedCover) {
    ensureCropMetrics(false);
  }
});

works = [
  ...getStoredWorks()
    .map((work, index) => normalizeWork(work, index))
    .filter(Boolean),
  ...seedWorks.map((work, index) => normalizeWork(work, index + 100)).filter(Boolean),
];

try {
  applyInteractions();
  renderWorks();
} catch (error) {
  console.error("[viby] 作品列表渲染失败，已回退为仅展示示例作品", error);
  works = seedWorks.map((work, index) => normalizeWork(work, index + 100)).filter(Boolean);
  applyInteractions();
  renderWorks();
}

renderCoverThumbs();
updateLoginState();

(async () => {
  const oauthResult = new URLSearchParams(window.location.search).get("github_login");
  await ensureBackendProbe();
  await syncServerSession();
  if (getUser()) {
    closeLogin();
    if (oauthResult === "success") {
      activeProfileContext = buildProfileContext();
      pendingProfileAvatar = null;
      renderProfilePanel();
      profileOverlay.classList.add("is-open");
      profileOverlay.setAttribute("aria-hidden", "false");
    }
  }
  handleAuthRedirectMessage();
  bindTilt(document.querySelectorAll(".logo-card, .floating-card, .creator-card"));
})();
