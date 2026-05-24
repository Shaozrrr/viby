const grid = document.querySelector("#allWorksGrid");
const pagination = document.querySelector("#worksPagination");
const paginationGuide = document.querySelector("#paginationGuide");
const searchInput = document.querySelector("#worksSearchInput");
const resultSummary = document.querySelector("#worksResultSummary");
const resetFiltersButton = document.querySelector("#worksResetFilters");
const githubOnlyInput = document.querySelector("#worksGithubOnly");
const scopeButtons = document.querySelectorAll("[data-search-scope]");
const categoryButtons = document.querySelectorAll("[data-category-filter]");

const storageKey = "viby-works";
const authKey = "viby-user";
const profilePrefsKey = "viby-profile-prefs";
const oneDay = 24 * 60 * 60 * 1000;
const pageSize = 9;

const viewState = {
  page: 1,
  query: "",
  scope: "all",
  category: "all",
  githubOnly: false,
};

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
  ["灵感卡片", "把一个产品想法整理成清晰的功能卡片和首屏文案。", "app", 42, 1280, 2, 0, ""],
  ["Form Echo", "给独立开发者用的轻量反馈收集组件。", "website", 67, 2104, 13, 1, "https://github.com/example/form-echo"],
  ["Tiny Invoice", "输入项目和金额，一键生成漂亮发票页面。", "website", 31, 1416, 35, 2, ""],
  ["Launch Desk", "整理发布清单、素材和复盘记录。", "website", 29, 842, 4, 1, ""],
  ["Habit Pulse", "一个轻量习惯追踪 APP，用柔和图表展示进展。", "app", 25, 733, 5, 0, ""],
  ["Note Garden", "把零散笔记变成可检索的个人知识花园。", "website", 34, 1012, 8, 2, "https://github.com/example/note-garden"],
  ["Fit Screen", "根据不同设备尺寸快速预览页面视觉效果。", "app", 18, 618, 18, 1, ""],
  ["Copy Room", "为产品页面生成多版本标题、卖点和行动按钮。", "website", 21, 940, 28, 0, ""],
  ["Mood Board", "收集截图和配色，生成一个轻量设计灵感板。", "website", 16, 512, 6, 2, ""],
  ["Focus Bell", "适合远程工作的番茄钟和提醒面板。", "app", 14, 460, 10, 1, ""],
  ["Mini CRM", "给个人创作者管理合作线索的小型客户表。", "website", 13, 386, 11, 0, ""],
  ["Pocket Plan", "把待办、日程和项目计划放进一个极简面板。", "app", 12, 320, 12, 2, ""],
].map(([title, description, category, likes, views, days, authorIndex, github], index) => {
  const author = seedAuthors[authorIndex];
  return {
    id: `seed-${index}`,
    title,
    description,
    category,
    type: category === "app" ? "App" : "Website",
    url: "https://example.com",
    github,
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

const getCategoryText = (category) => (safeTrim(category).toLowerCase() === "app" ? "APP" : "网站");

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
    category: safeTrim(work.category).toLowerCase() === "website" ? "website" : "app",
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
    github: safeTrim(work.github),
  };
};

const allWorks = [...getStoredWorks(), ...seedWorks]
  .map((work, index) => normalizeWork(work, index))
  .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

const matchesSearch = (work, query, scope) => {
  if (!query) return true;
  const normalizedQuery = query.toLowerCase();
  const title = safeTrim(work.title).toLowerCase();
  const description = safeTrim(work.description).toLowerCase();
  const authorName = safeTrim(work.authorName).toLowerCase();
  const tool = safeTrim(work.tool).toLowerCase();
  const stack = safeTrim(work.stack).toLowerCase();

  if (scope === "title") return title.includes(normalizedQuery);
  if (scope === "description") return description.includes(normalizedQuery);

  return [title, description, authorName, tool, stack].some((item) => item.includes(normalizedQuery));
};

const getFilteredWorks = () =>
  allWorks.filter((work) => {
    if (viewState.category !== "all" && work.category !== viewState.category) return false;
    if (viewState.githubOnly && !safeTrim(work.github)) return false;
    if (!matchesSearch(work, viewState.query, viewState.scope)) return false;
    return true;
  });

const buildEmptyState = () => `
  <article class="works-empty-state">
    <span class="works-empty-kicker">No matching builds</span>
    <h3>暂时没有符合条件的作品</h3>
    <p>你可以放宽筛选条件，或清空搜索后重新浏览全部作品。</p>
  </article>
`;

const buildWorkCard = (work, rank) => {
  const author = getAuthorForWork(work);
  const meta = buildCardMetaItems(work);
  return `
    <article class="work-card">
      <div class="rank-badge">${rank}</div>
      <div class="work-visual ${work.cover ? "has-cover" : work.visual}">
        ${work.cover ? `<img src="${work.cover}" alt="${escapeHTML(work.title)} 封面" />` : ""}
      </div>
      <div class="work-content">
        <div class="work-topline">
          <span class="work-type-chip">${escapeHTML(getCategoryText(work.category))}</span>
          <span class="work-date">${escapeHTML(formatRelativeDate(work.createdAt))}</span>
        </div>
        <div class="work-copy">
          <h3>${escapeHTML(work.title)}</h3>
          <p>${escapeHTML(work.description)}</p>
        </div>
        <div class="work-meta ${meta.length ? "" : "is-empty"}">
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
};

const renderPagination = (totalItems) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  pagination.innerHTML = "";
  pagination.hidden = totalItems <= pageSize;

  if (pagination.hidden) return;

  const buttons = [];
  buttons.push(`<button type="button" data-page-nav="prev" ${viewState.page === 1 ? "disabled" : ""}>上一页</button>`);
  for (let page = 1; page <= totalPages; page += 1) {
    buttons.push(
      `<button type="button" data-page="${page}" class="${page === viewState.page ? "active" : ""}">第 ${page} 页</button>`,
    );
  }
  buttons.push(
    `<button type="button" data-page-nav="next" ${viewState.page === totalPages ? "disabled" : ""}>下一页</button>`,
  );
  pagination.innerHTML = buttons.join("");
};

const renderSummary = (filteredWorks) => {
  const totalPages = Math.max(1, Math.ceil(filteredWorks.length / pageSize));
  const filterParts = [];

  if (viewState.scope === "title") filterParts.push("仅按名称搜索");
  if (viewState.scope === "description") filterParts.push("仅按简介搜索");
  if (viewState.category === "app") filterParts.push("只看 App");
  if (viewState.category === "website") filterParts.push("只看网站");
  if (viewState.githubOnly) filterParts.push("只看附带 GitHub");

  const hasFilters = Boolean(viewState.query || filterParts.length);
  const suffix = hasFilters ? ` · ${filterParts.join(" / ") || "按条件筛选中"}` : "";

  resultSummary.textContent = filteredWorks.length
    ? `共找到 ${filteredWorks.length} 个作品 · 第 ${viewState.page} / ${totalPages} 页${suffix}`
    : `当前没有符合条件的作品${suffix}`;

  resetFiltersButton.hidden = !hasFilters;
};

const render = () => {
  const filteredWorks = getFilteredWorks();
  const totalPages = Math.max(1, Math.ceil(filteredWorks.length / pageSize));
  if (viewState.page > totalPages) viewState.page = totalPages;

  const start = (viewState.page - 1) * pageSize;
  const pageItems = filteredWorks.slice(start, start + pageSize);

  grid.innerHTML = pageItems.length
    ? pageItems.map((work, index) => buildWorkCard(work, start + index + 1)).join("")
    : buildEmptyState();

  paginationGuide.textContent = filteredWorks.length
    ? totalPages > 1
      ? `当前第 ${viewState.page} 页，共 ${totalPages} 页。支持继续向后翻页浏览更多作品。`
      : "当前筛选结果已完整展示。"
    : "没有找到符合条件的作品，试试放宽筛选条件。";

  renderSummary(filteredWorks);
  renderPagination(filteredWorks.length);
};

const syncChipState = (buttons, key, value) => {
  buttons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset[key] === value);
  });
};

searchInput?.addEventListener("input", (event) => {
  viewState.query = safeTrim(event.target.value);
  viewState.page = 1;
  render();
});

githubOnlyInput?.addEventListener("change", (event) => {
  viewState.githubOnly = Boolean(event.target.checked);
  viewState.page = 1;
  render();
});

scopeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    viewState.scope = button.dataset.searchScope || "all";
    viewState.page = 1;
    syncChipState(scopeButtons, "searchScope", viewState.scope);
    render();
  });
});

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    viewState.category = button.dataset.categoryFilter || "all";
    viewState.page = 1;
    syncChipState(categoryButtons, "categoryFilter", viewState.category);
    render();
  });
});

resetFiltersButton?.addEventListener("click", () => {
  viewState.page = 1;
  viewState.query = "";
  viewState.scope = "all";
  viewState.category = "all";
  viewState.githubOnly = false;

  if (searchInput) searchInput.value = "";
  if (githubOnlyInput) githubOnlyInput.checked = false;
  syncChipState(scopeButtons, "searchScope", viewState.scope);
  syncChipState(categoryButtons, "categoryFilter", viewState.category);
  render();
});

pagination?.addEventListener("click", (event) => {
  const pageButton = event.target.closest("[data-page]");
  const navButton = event.target.closest("[data-page-nav]");
  const totalPages = Math.max(1, Math.ceil(getFilteredWorks().length / pageSize));

  if (pageButton) {
    viewState.page = Number(pageButton.dataset.page);
  } else if (navButton?.dataset.pageNav === "prev" && viewState.page > 1) {
    viewState.page -= 1;
  } else if (navButton?.dataset.pageNav === "next" && viewState.page < totalPages) {
    viewState.page += 1;
  } else {
    return;
  }

  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

render();
