const shareSurface = document.querySelector("#shareSurface");
const shareSurfaceStatus = document.querySelector("#shareSurfaceStatus");

const safeTrim = (value) => String(value || "").trim();
const escapeHTML = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const formatNumber = (value) => {
  const num = Number(value) || 0;
  if (num >= 1000) return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}k`;
  return String(num);
};

const formatDate = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};

const renderWorkShare = (share) => {
  shareSurface.innerHTML = `
    <div class="share-card share-card-work">
      <div class="share-card-media">
        ${share.cover ? `<img src="${share.cover}" alt="${escapeHTML(share.title)}" />` : `<div class="share-card-fallback">Viby</div>`}
      </div>
      <div class="share-card-copy">
        <span class="share-card-kicker">${escapeHTML(share.category || "作品分享")}</span>
        <h1>${escapeHTML(share.title)}</h1>
        <p>${escapeHTML(share.description)}</p>
        <div class="share-card-meta">
          ${(share.meta || []).map((item) => `<span>${escapeHTML(item)}</span>`).join("")}
          ${share.versionTag ? `<span>${escapeHTML(share.versionTag)}</span>` : ""}
        </div>
        <div class="share-card-author">
          <img src="${share.author?.avatar || "./logo-source.png"}" alt="${escapeHTML(share.author?.name || "Viby 创作者")}" />
          <div>
            <strong>${escapeHTML(share.author?.name || "Viby 创作者")}</strong>
            <small>${escapeHTML(share.author?.handle || "@creator")}</small>
          </div>
        </div>
        <div class="share-card-links">
          ${share.primaryUrl ? `<a href="${share.primaryUrl}" target="_blank" rel="noreferrer noopener nofollow">${escapeHTML(share.primaryLabel || "访问作品")}</a>` : ""}
          ${share.github ? `<a href="${share.github}" target="_blank" rel="noreferrer noopener nofollow">GitHub</a>` : ""}
          <a href="./index.html">打开 Viby</a>
        </div>
        <div class="share-card-foot">${escapeHTML(formatDate(share.createdAt) || "Viby 分享页")}</div>
      </div>
    </div>
  `;
};

const renderProfileShare = (share) => {
  shareSurface.innerHTML = `
    <div class="share-card share-card-profile">
      <div class="share-profile-hero">
        <img class="share-profile-avatar" src="${share.author?.avatar || "./logo-source.png"}" alt="${escapeHTML(share.author?.name || "创作者")}" />
        <div class="share-profile-copy">
          <span class="share-card-kicker">Creator profile</span>
          <h1>${escapeHTML(share.title)}</h1>
          <p>${escapeHTML(share.description)}</p>
          <small>${escapeHTML(share.author?.handle || "@creator")}</small>
        </div>
      </div>
      <div class="share-profile-stats">
        <span><strong>${formatNumber(share.stats?.works)}</strong>作品</span>
        <span><strong>${formatNumber(share.stats?.views)}</strong>浏览</span>
        <span><strong>${formatNumber(share.stats?.likes)}</strong>赞</span>
      </div>
      <div class="share-profile-grid">
        ${(share.worksPreview || [])
          .map(
            (work) => `
              <div class="share-profile-tile">
                <div class="share-profile-tile-media">
                  ${work.cover ? `<img src="${work.cover}" alt="${escapeHTML(work.title)}" />` : `<div class="share-card-fallback">Viby</div>`}
                </div>
                <div class="share-profile-tile-copy">
                  <strong>${escapeHTML(work.title)}</strong>
                  <small>${escapeHTML(work.category)}</small>
                </div>
              </div>
            `,
          )
          .join("")}
      </div>
      <div class="share-card-links">
        ${share.libraryUrl ? `<a href="${share.libraryUrl}">查看作品库</a>` : ""}
        <a href="./index.html">打开 Viby</a>
      </div>
    </div>
  `;
};

const renderShare = (share) => {
  const template = safeTrim(share.template) || "aurora";
  shareSurface.className = `share-surface share-template-${template}`;
  if (share.kind === "profile") {
    renderProfileShare(share);
    return;
  }
  renderWorkShare(share);
};

const loadShare = async () => {
  const params = new URLSearchParams(window.location.search);
  const id = safeTrim(params.get("id"));
  if (!id) {
    shareSurfaceStatus.textContent = "缺少分享内容";
    return;
  }

  try {
    const response = await fetch(`/api/shares/${encodeURIComponent(id)}`, {
      credentials: "same-origin",
      cache: "no-store",
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.share) {
      shareSurfaceStatus.textContent = result.error || "这条分享页暂时不可用";
      return;
    }
    renderShare(result.share);
  } catch {
    shareSurfaceStatus.textContent = "分享页加载失败，请稍后重试";
  }
};

void loadShare();
