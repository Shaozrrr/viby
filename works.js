const grid = document.querySelector("#allWorksGrid");
const pageButtons = document.querySelectorAll("[data-page]");
const paginationGuide = document.querySelector("#paginationGuide");

const storageKey = "viby-works";
const authKey = "viby-user";
const profilePrefsKey = "viby-profile-prefs";
const oneDay = 24 * 60 * 60 * 1000;

let currentPage = 1;

const safeTrim = (value) => String(value || "").trim();
const escapeHTML = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

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
    avatar: createAvatarDataUrl("玲羽", "#7553ff", "#ff8a6c"),
  },
  {
    id: "seed-author-mori",
    name: "Mori Lab",
    handle: "@mori-lab",
    avatar: createAvatarDataUrl("ML", "#111827", "#2dd4bf"),
  },
  {
    id: "seed-author-zhou",
    name: "周野",
    handle: "@zhouye",
    avatar: createAvatarDataUrl("周野", "#ef6b5c", "#8b5cf6"),
  },
];

const seedWorks = [
  ["灵感卡片", "把一个产品想法整理成清晰的功能卡片和首屏文案。", "app", 42, 1280, 2, 0],
  ["Form Echo", "给独立开发者用的轻量反馈收集组件。", "website", 67, 2104, 13, 1],
  ["Tiny Invoice", "输入项目和金额，一键生成漂亮发票页面。", "website", 31, 1416, 35, 2],
  ["Launch Desk", "整理发布清单、素材和复盘记录。", "website", 29, 842, 4, 1],
  ["Habit Pulse", "一个轻量习惯追踪 APP，用柔和图表展示进展。", "app", 25, 733, 5, 0],
  ["Note Garden", "把零散笔记变成可检索的个人知识花园。", "website", 34, 1012, 8, 2],
  ["Fit Screen", "根据不同设备尺寸快速预览页面视觉效果。", "app", 18, 618, 18, 1],
  ["Copy Room", "为产品页面生成多版本标题、卖点和行动按钮。", "website", 21, 940, 28, 0],
  ["Mood Board", "收集截图和配色，生成一个轻量设计灵感板。", "website", 16, 512, 6, 2],
  ["Focus Bell", "适合远程工作的番茄钟和提醒面板。", "app", 14, 460, 10, 1],
  ["Mini CRM", "给个人创作者管理合作线索的小型客户表。", "website", 13, 386, 11, 0],
  ["Pocket Plan", "把待办、日程和项目计划放进一个极简面板。", "app", 12, 320, 12, 2],
].map(([title, description, category, likes, views, days, authorIndex], index) => {
  const author = seedAuthors[authorIndex];
  return {
    id: `seed-${index}`,
    title,
    description,
    category,
    type: category === "app" ? "App" : "Website",
    url: "https://example.com",
    github: "",
    devices: category === "app" ? ["手机端", "电脑端"] : ["电脑端"],
    visual: ["visual-one", "visual-two", "visual-three"][index % 3],
    cover: "",
    photos: [],
    createdAt: Date.now() - days * oneDay,
    views,
    likes,
    authorId: author.id,
    authorName: author.name,
    authorAvatar: author.avatar,
    authorHandle: author.handle,
  };
});

const getStoredWorks = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(storageKey) || "null");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
};

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(authKey));
  } catch {
    return null;
  }
};

const getProfilePrefs = (userId) => {
  try {
    const map = JSON.parse(localStorage.getItem(profilePrefsKey) || "{}");
    return map[userId] || {};
  } catch {
    return {};
  }
};

const formatHandle = (handle, fallbackName = "creator") => {
  const raw = safeTrim(handle);
  if (raw.startsWith("@")) return raw;
  if (raw) return `@${raw}`;
  return `@${safeTrim(fallbackName).toLowerCase().replace(/\s+/g, "-") || "creator"}`;
};

const formatNumber = (value) => {
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  return String(value);
};

const formatRelativeDate = (timestamp) => {
  const diff = Date.now() - timestamp;
  const days = Math.floor(diff / oneDay);
  if (days <= 0) return "今天发布";
  if (days === 1) return "1 天前";
  if (days < 30) return `${days} 天前`;
  return `${Math.floor(days / 30)} 个月前`;
};

const getCategoryText = (category) => (category === "app" ? "APP" : "网站");

const sanitizeMetaLabel = (value) => {
  const text = safeTrim(value);
  if (!text) return "";
  if (text.toLowerCase() === "live") return "";
  if (text.toLowerCase() === "v0") return "";
  return text;
};

const dedupePhotos = (photos) =>
  [...new Set((Array.isArray(photos) ? photos : []).map((item) => safeTrim(item)).filter(Boolean))];

const getPrimaryActionLabel = (work) =>
  safeTrim(work.linkType).toLowerCase() === "appstore" ? "查看 App Store" : "访问作品";

const buildCardMetaItems = (work) => {
  const items = [
    (work.devices || ["电脑端"]).join(" / "),
    safeTrim(work.linkType).toLowerCase() === "appstore" ? "App Store" : "",
    work.github ? "GitHub" : "",
    sanitizeMetaLabel(work.type),
  ]
    .filter(Boolean)
    .filter((item, index, list) => list.indexOf(item) === index);

  return items.slice(0, 3);
};

const getAuthorForWork = (work) => {
  const currentUser = getUser();
  if (currentUser && work.authorId === currentUser.id) {
    const prefs = getProfilePrefs(currentUser.id);
    const displayName = safeTrim(
      prefs.displayName || currentUser.name || (currentUser.email || "").split("@")[0] || work.authorName,
    );
    const avatarUrl = safeTrim(prefs.avatarDataUrl || currentUser.avatar) || work.authorAvatar;
    return {
      displayName,
      avatarUrl,
      handle: formatHandle((currentUser.email || displayName).split("@")[0], displayName),
    };
  }

  return {
    displayName: safeTrim(work.authorName) || "匿名创作者",
    avatarUrl: safeTrim(work.authorAvatar),
    handle: formatHandle(work.authorHandle, work.authorName),
  };
};

const normalizeWork = (work, index) => {
  const fallbackAuthor = seedAuthors[index % seedAuthors.length];
  const photos = dedupePhotos(Array.isArray(work.photos) ? work.photos : work.cover ? [work.cover] : []);
  return {
    ...work,
    cover: photos[0] || safeTrim(work.cover),
    photos,
    linkType: safeTrim(work.linkType).toLowerCase() === "appstore" ? "appstore" : "website",
    devices: Array.isArray(work.devices) && work.devices.length ? work.devices : ["电脑端"],
    visual: safeTrim(work.visual) || ["visual-one", "visual-two", "visual-three"][index % 3],
    authorId: safeTrim(work.authorId) || fallbackAuthor.id,
    authorName: safeTrim(work.authorName) || fallbackAuthor.name,
    authorAvatar: safeTrim(work.authorAvatar) || fallbackAuthor.avatar,
    authorHandle: formatHandle(work.authorHandle || fallbackAuthor.handle, work.authorName || fallbackAuthor.name),
    likes: Number.isFinite(work.likes) ? work.likes : 0,
    views: Number.isFinite(work.views) ? work.views : 0,
    createdAt: Number.isFinite(work.createdAt) ? work.createdAt : Date.now(),
  };
};

const allWorks = [...getStoredWorks(), ...seedWorks]
  .map((work, index) => normalizeWork(work, index))
  .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

const render = () => {
  const start = (currentPage - 1) * 9;
  const works = allWorks.slice(start, start + 9);
  grid.innerHTML = works
    .map((work, index) => {
      const author = getAuthorForWork(work);
      const meta = buildCardMetaItems(work);
      return `
        <article class="work-card">
          <div class="rank-badge">${start + index + 1}</div>
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
              <div class="author-chip is-static">
                <img class="author-avatar" src="${author.avatarUrl}" alt="${escapeHTML(author.displayName)}" />
                <span class="author-copy">
                  <strong>${escapeHTML(author.displayName)}</strong>
                  <small>${escapeHTML(author.handle)}</small>
                </span>
              </div>
              <div class="work-stats-inline">
                <span>${formatNumber(work.views)} 浏览</span>
                <span>${formatNumber(work.likes)} 赞</span>
              </div>
            </div>
            <div class="work-actions">
              <a href="${work.url}" target="_blank" rel="noreferrer">${getPrimaryActionLabel(work)}</a>
              ${work.github ? `<a href="${work.github}" target="_blank" rel="noreferrer">GitHub</a>` : ""}
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  const totalPages = Math.ceil(allWorks.length / 9);
  paginationGuide.textContent =
    totalPages > 1
      ? `当前第 ${currentPage} 页，共 ${totalPages} 页。作者信息和访问入口都已经直接展示在卡片里。`
      : "当前已经展示全部作品。";
};

pageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentPage = Number(button.dataset.page);
    pageButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

render();
