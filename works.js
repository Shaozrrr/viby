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

const fallbackAvatarPalettes = [
  ["#7553ff", "#ff8a6c"],
  ["#111827", "#2dd4bf"],
  ["#ef6b5c", "#8b5cf6"],
  ["#4f46e5", "#22c55e"],
];

const buildFallbackAuthor = (work = {}, index = 0) => {
  const [colorA, colorB] = fallbackAvatarPalettes[index % fallbackAvatarPalettes.length];
  const name = safeTrim(work.authorName) || "Viby 创作者";
  return {
    id: safeTrim(work.authorId) || `fallback-author-${index}`,
    name,
    handle: formatHandle(work.authorHandle, name),
    avatar: safeTrim(work.authorAvatar) || createAvatarDataUrl(name.slice(0, 2), colorA, colorB),
  };
};

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
const getPrimaryActionLabel = (work) =>
  safeTrim(work.linkType).toLowerCase() === "appstore" ? "查看 App Store" : "访问作品";

const sanitizeMetaLabel = (value) => {
  const text = safeTrim(value);
  if (!text) return "";
  if (text.toLowerCase() === "live") return "";
  if (text.toLowerCase() === "v0") return "";
  return text;
};

const dedupePhotos = (photos) =>
  [...new Set((Array.isArray(photos) ? photos : []).map((item) => safeTrim(item)).filter(Boolean))];

const dedupeTextList = (items) =>
  [...new Set((Array.isArray(items) ? items : []).map((item) => safeTrim(item)).filter(Boolean))];

const isIpHost = (hostname) => /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname);
const isGithubHost = (hostname) => ["github.com", "www.github.com", "gist.github.com"].includes(hostname);
const isAppStoreHost = (hostname) => ["apps.apple.com", "appsto.re"].includes(hostname);

const analyzeExternalUrl = (value, { kind = "primary", linkType = "website" } = {}) => {
  const raw = safeTrim(value);
  if (!raw) return { normalized: "", level: "normal", reasons: [] };

  try {
    const parsed = new URL(raw);
    const protocol = parsed.protocol.toLowerCase();
    const hostname = parsed.hostname.toLowerCase();
    const reasons = [];

    if (["javascript:", "data:", "file:", "vbscript:", "blob:", "about:"].includes(protocol)) {
      return { normalized: raw, level: "caution", reasons: ["链接协议异常"] };
    }

    if (parsed.username || parsed.password) reasons.push("链接中包含账号信息");
    if (hostname.startsWith("xn--")) reasons.push("域名使用了转码字符");
    if (isIpHost(hostname)) reasons.push("链接使用了 IP 地址");
    if (protocol !== "https:") reasons.push("链接未启用 HTTPS");
    if (parsed.port && !["80", "443"].includes(parsed.port)) reasons.push("链接使用了非常见端口");
    if (kind === "github" && !isGithubHost(hostname)) reasons.push("不是 GitHub 官方域名");
    if (kind === "primary" && safeTrim(linkType).toLowerCase() === "appstore" && !isAppStoreHost(hostname)) {
      reasons.push("导流方式为 App Store，但域名不是 App Store 官方地址");
    }

    return {
      normalized: parsed.toString(),
      level: reasons.length ? "caution" : "normal",
      reasons,
    };
  } catch {
    return { normalized: raw, level: "caution", reasons: ["链接格式异常"] };
  }
};

const hasLinkRisk = (work) =>
  safeTrim(work.urlSafetyLevel) === "caution" || safeTrim(work.githubSafetyLevel) === "caution";

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
  const fallbackAuthor = buildFallbackAuthor(work, index);
  const photos = dedupePhotos(Array.isArray(work.photos) ? work.photos : work.cover ? [work.cover] : []);
  const urlSafety = analyzeExternalUrl(work.url, { kind: "primary", linkType: work.linkType });
  const githubSafety = analyzeExternalUrl(work.github, { kind: "github" });

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
    github: safeTrim(githubSafety.normalized || work.github),
    url: safeTrim(urlSafety.normalized || work.url),
    urlSafetyLevel:
      safeTrim(work.urlSafetyLevel) === "caution" || urlSafety.level === "caution" ? "caution" : "normal",
    urlSafetyReasons: dedupeTextList(work.urlSafetyReasons?.length ? work.urlSafetyReasons : urlSafety.reasons),
    githubSafetyLevel:
      safeTrim(work.githubSafetyLevel) === "caution" || githubSafety.level === "caution" ? "caution" : "normal",
    githubSafetyReasons: dedupeTextList(
      work.githubSafetyReasons?.length ? work.githubSafetyReasons : githubSafety.reasons,
    ),
    tool: safeTrim(work.tool),
    stack: safeTrim(work.stack),
  };
};

const allWorks = getStoredWorks()
  .map((work, index) => normalizeWork(work, index))
  .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

const normalizeSearchText = (value) =>
  safeTrim(value)
    .toLowerCase()
    .normalize("NFKC")
    .replace(/\s+/g, " ");

const fuzzySubsequence = (haystack, needle) => {
  if (!needle) return true;
  let matchIndex = 0;
  for (const char of haystack) {
    if (char === needle[matchIndex]) matchIndex += 1;
    if (matchIndex === needle.length) return true;
  }
  return false;
};

const fuzzyIncludes = (haystack, query) => {
  const source = normalizeSearchText(haystack);
  const needle = normalizeSearchText(query);
  if (!needle) return true;
  if (source.includes(needle)) return true;

  const compactSource = source.replace(/\s+/g, "");
  const compactNeedle = needle.replace(/\s+/g, "");
  if (compactSource.includes(compactNeedle)) return true;

  const tokens = needle.split(" ").filter(Boolean);
  if (tokens.length > 1 && tokens.every((token) => source.includes(token) || fuzzySubsequence(compactSource, token))) {
    return true;
  }

  return fuzzySubsequence(compactSource, compactNeedle);
};

const matchesSearch = (work, query, scope) => {
  if (!query) return true;
  const fields = {
    title: [work.title],
    description: [work.description],
    all: [work.title, work.description, work.authorName, work.tool, work.stack],
  };

  return (fields[scope] || fields.all).some((item) => fuzzyIncludes(item, query));
};

const getFilteredWorks = () =>
  allWorks.filter((work) => {
    if (viewState.category !== "all" && work.category !== viewState.category) return false;
    if (viewState.githubOnly && !safeTrim(work.github)) return false;
    if (!matchesSearch(work, viewState.query, viewState.scope)) return false;
    return true;
  });

const buildEmptyState = (hasWorks) => `
  <article class="works-empty-state">
    <span class="works-empty-kicker">${hasWorks ? "No matching builds" : "First official works"}</span>
    <h3>${hasWorks ? "暂时没有符合条件的作品" : "这里暂时还没有正式发布的作品"}</h3>
    <p>${hasWorks ? "你可以放宽筛选条件，或清空搜索后重新浏览全部作品。" : "占位演示作品已经移除。等真实用户发布后，这里会展示正式作品列表。"}</p>
  </article>
`;

const buildCardMetaItems = (work) => {
  const items = [
    (work.devices || ["电脑端"]).join(" / "),
    safeTrim(work.linkType).toLowerCase() === "appstore" ? "App Store" : "",
    work.github ? "GitHub" : "",
    hasLinkRisk(work) ? "外链请谨慎" : "",
    sanitizeMetaLabel(work.type),
  ]
    .filter(Boolean)
    .filter((item, index, list) => list.indexOf(item) === index);

  return items.slice(0, 3);
};

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
          <a href="${work.url}" target="_blank" rel="noreferrer noopener nofollow">${getPrimaryActionLabel(work)}</a>
          ${work.github ? `<a href="${work.github}" target="_blank" rel="noreferrer noopener nofollow">GitHub</a>` : ""}
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
  if (viewState.query) filterParts.push(`模糊搜索“${viewState.query}”`);

  const hasFilters = Boolean(filterParts.length);
  resultSummary.textContent = filteredWorks.length
    ? `共找到 ${filteredWorks.length} 个作品 · 第 ${viewState.page} / ${totalPages} 页${hasFilters ? ` · ${filterParts.join(" / ")}` : ""}`
    : hasFilters
      ? "当前筛选条件下没有匹配作品"
      : "当前还没有正式发布的作品";

  resetFiltersButton.hidden = !hasFilters;
};

const renderGrid = () => {
  const filteredWorks = getFilteredWorks();
  const totalPages = Math.max(1, Math.ceil(filteredWorks.length / pageSize));
  viewState.page = Math.min(viewState.page, totalPages);
  const start = (viewState.page - 1) * pageSize;
  const items = filteredWorks.slice(start, start + pageSize);

  renderSummary(filteredWorks);
  paginationGuide.textContent = filteredWorks.length
    ? `按发布时间倒序展示，共 ${filteredWorks.length} 个结果。`
    : allWorks.length
      ? "可以尝试放宽筛选条件，查看更多作品。"
      : "清理演示作品后，这里只展示真实发布的内容。";

  grid.innerHTML = items.length
    ? items.map((work, index) => buildWorkCard(work, start + index + 1)).join("")
    : buildEmptyState(Boolean(allWorks.length));

  renderPagination(filteredWorks.length);
};

const syncButtons = (buttons, activeValue, dataKey) => {
  buttons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset[dataKey] === activeValue);
  });
};

searchInput?.addEventListener("input", () => {
  viewState.query = safeTrim(searchInput.value);
  viewState.page = 1;
  renderGrid();
});

githubOnlyInput?.addEventListener("change", () => {
  viewState.githubOnly = githubOnlyInput.checked;
  viewState.page = 1;
  renderGrid();
});

scopeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    viewState.scope = button.dataset.searchScope || "all";
    viewState.page = 1;
    syncButtons(scopeButtons, viewState.scope, "searchScope");
    renderGrid();
  });
});

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    viewState.category = button.dataset.categoryFilter || "all";
    viewState.page = 1;
    syncButtons(categoryButtons, viewState.category, "categoryFilter");
    renderGrid();
  });
});

resetFiltersButton?.addEventListener("click", () => {
  viewState.query = "";
  viewState.scope = "all";
  viewState.category = "all";
  viewState.githubOnly = false;
  viewState.page = 1;

  if (searchInput) searchInput.value = "";
  if (githubOnlyInput) githubOnlyInput.checked = false;
  syncButtons(scopeButtons, "all", "searchScope");
  syncButtons(categoryButtons, "all", "categoryFilter");
  renderGrid();
});

pagination?.addEventListener("click", (event) => {
  const pageButton = event.target.closest("[data-page]");
  const navButton = event.target.closest("[data-page-nav]");
  const totalPages = Math.max(1, Math.ceil(getFilteredWorks().length / pageSize));

  if (pageButton) {
    viewState.page = Number.parseInt(pageButton.dataset.page || "1", 10);
    renderGrid();
    return;
  }

  if (navButton) {
    if (navButton.dataset.pageNav === "prev" && viewState.page > 1) {
      viewState.page -= 1;
    }
    if (navButton.dataset.pageNav === "next" && viewState.page < totalPages) {
      viewState.page += 1;
    }
    renderGrid();
  }
});

renderGrid();
