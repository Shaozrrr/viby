const shareSurface = document.querySelector("#shareSurface");
const shareSurfaceStatus = document.querySelector("#shareSurfaceStatus");
const sharePageLegalNote = document.querySelector("#sharePageLegalNote");
const linkGuardOverlay = document.querySelector(".link-guard-overlay");
const closeLinkGuardButtons = document.querySelectorAll("[data-close-link-guard]");
const confirmLinkGuardButton = document.querySelector("[data-confirm-link-guard]");
const linkGuardTitle = document.querySelector("#linkGuardTitle");
const linkGuardIntro = document.querySelector("#linkGuardIntro");
const linkGuardChip = document.querySelector("#linkGuardChip");
const linkGuardReasons = document.querySelector("#linkGuardReasons");
const externalSensitiveDataWarning = "请不要在陌生页面输入密码、短信验证码、银行卡、助记词或私钥。";
const officialPlatformUrl = "https://viby.ink";
let activeShareRecord = null;
let activeLinkGuardContext = null;

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

const formatDisplayUrl = (value) => {
  const raw = safeTrim(value);
  if (!raw) return "";
  try {
    const parsed = new URL(raw);
    return `${parsed.hostname.replace(/^www\./, "")}${parsed.pathname === "/" ? "" : parsed.pathname}`;
  } catch {
    return raw.replace(/^https?:\/\//, "");
  }
};

const isLocalPlatformUrl = (value) => {
  const raw = safeTrim(value);
  if (!raw) return true;
  try {
    const parsed = new URL(raw);
    return ["localhost", "127.0.0.1"].includes(parsed.hostname) || parsed.hostname.endsWith(".local");
  } catch {
    return true;
  }
};

const getPlatformUrl = (share) => {
  const shareUrl = safeTrim(share?.platformUrl);
  if (shareUrl && !isLocalPlatformUrl(shareUrl)) return shareUrl;
  if (!isLocalPlatformUrl(window.location.origin)) return window.location.origin;
  return officialPlatformUrl;
};
const getPlatformLabel = (share) => formatDisplayUrl(getPlatformUrl(share)) || "viby";
const renderMetaChips = (items = []) => items.map((item) => `<span>${escapeHTML(item)}</span>`).join("");
const renderRiskList = (items = []) =>
  items.length
    ? `<div class="share-safety-panel">${items
        .map((item) => `<div class="share-safety-item">${escapeHTML(item)}</div>`)
        .join("")}</div>`
    : "";

const renderBrandRail = (share, kicker = "Built on Viby") => `
  <div class="share-brand-rail">
    <a class="share-brand-lockup" href="./index.html" aria-label="打开 Viby">
      <img src="./logo-source.png" alt="Viby" />
      <span>
        <small>${escapeHTML(kicker)}</small>
        <strong>Viby</strong>
      </span>
    </a>
    <div class="share-brand-url">${escapeHTML(getPlatformLabel(share))}</div>
  </div>
`;

const renderShareMedia = (share) => {
  const cover = safeTrim(share.cover);
  const title = escapeHTML(share.title || "Viby");
  const authorName = escapeHTML(share.author?.name || "Viby creator");
  const platformLabel = escapeHTML(getPlatformLabel(share));
  return `
    <div class="share-card-media share-stage-media${cover ? "" : " is-media-missing"}" data-share-media>
      <div class="share-card-fallback">
        <strong>Viby</strong>
        <span>${title}</span>
      </div>
      ${
        cover
          ? `<img src="${escapeHTML(cover)}" alt="${title}" loading="eager" referrerpolicy="no-referrer" />`
          : ""
      }
      <div class="share-stage-caption">
        <strong>${authorName}</strong>
        <small>${platformLabel}</small>
      </div>
    </div>
  `;
};

const getHostnameLabel = (value) => {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return safeTrim(value);
  }
};

const buildLinkGuardContext = (kind = "primary") => {
  if (!activeShareRecord || activeShareRecord.kind !== "work") return null;
  const isGithub = kind === "github";
  const url = safeTrim(isGithub ? activeShareRecord.github : activeShareRecord.primaryUrl);
  if (!url) return null;
  const reasons = Array.isArray(isGithub ? activeShareRecord.githubSafetyReasons : activeShareRecord.urlSafetyReasons)
    ? (isGithub ? activeShareRecord.githubSafetyReasons : activeShareRecord.urlSafetyReasons).map((item) => safeTrim(item)).filter(Boolean)
    : [];
  const risky = safeTrim(isGithub ? activeShareRecord.githubSafetyLevel : activeShareRecord.urlSafetyLevel) === "caution";
  return {
    url,
    hostname: getHostnameLabel(url),
    label: isGithub ? "打开 GitHub" : safeTrim(activeShareRecord.primaryLabel || "访问作品"),
    reasons,
    shouldGuard: risky,
  };
};

const renderLinkGuard = (context) => {
  if (!linkGuardTitle || !linkGuardIntro || !linkGuardChip || !linkGuardReasons) return;
  if (!context) {
    linkGuardChip.innerHTML = "";
    linkGuardReasons.hidden = true;
    linkGuardReasons.innerHTML = "";
    return;
  }
  linkGuardTitle.textContent = context.shouldGuard ? "即将访问存在风险提示的外链" : "即将离开 Viby";
  linkGuardIntro.textContent = context.shouldGuard
    ? `系统已为这条链接标记风险提示。继续前，请再次核对目标域名，并牢记：${externalSensitiveDataWarning}`
    : `你将访问第三方站点。继续前，请自行核对域名与页面真实性。${externalSensitiveDataWarning}`;
  linkGuardChip.innerHTML = `
    <strong>${escapeHTML(context.label)}</strong>
    <small>${escapeHTML(context.hostname || context.url)}</small>
  `;
  if (context.reasons.length) {
    linkGuardReasons.hidden = false;
    linkGuardReasons.innerHTML = context.reasons
      .map((reason) => `<div class="link-guard-reason">${escapeHTML(reason)}</div>`)
      .join("");
  } else {
    linkGuardReasons.hidden = true;
    linkGuardReasons.innerHTML = "";
  }
};

const closeLinkGuard = () => {
  linkGuardOverlay?.classList.remove("is-open");
  linkGuardOverlay?.setAttribute("aria-hidden", "true");
  activeLinkGuardContext = null;
  renderLinkGuard(null);
};

const openOutboundLink = (url) => {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
};

const activateShareMediaFallbacks = () => {
  const mediaCards = shareSurface?.querySelectorAll("[data-share-media]") || [];
  mediaCards.forEach((card) => {
    const image = card.querySelector("img");
    if (!image) return;
    const markLoaded = () => card.classList.add("is-media-ready");
    const markMissing = () => card.classList.add("is-media-missing");
    if (image.complete && image.naturalWidth > 0) {
      markLoaded();
      return;
    }
    image.addEventListener("load", markLoaded, { once: true });
    image.addEventListener("error", markMissing, { once: true });
  });
};

const renderWorkShare = (share) => {
  const linkReasons = [
    ...(Array.isArray(share.urlSafetyReasons) ? share.urlSafetyReasons : []),
    ...(Array.isArray(share.githubSafetyReasons) ? share.githubSafetyReasons : []),
  ]
    .map((item) => safeTrim(item))
    .filter(Boolean);
  shareSurface.innerHTML = `
    <div class="share-composition share-composition-work">
      ${renderBrandRail(share)}
      <div class="share-hero-grid">
        <div class="share-hero-stage">
          <div class="share-hero-glow"></div>
          ${renderShareMedia(share)}
          <div class="share-stage-float share-stage-float-top">
            <span>${escapeHTML(share.category || "作品分享")}</span>
            <span>${escapeHTML(share.versionTag || "Live")}</span>
          </div>
          <div class="share-stage-float share-stage-float-bottom">
            <span>${escapeHTML(getPlatformLabel(share))}</span>
          </div>
        </div>
        <div class="share-story-panel">
          <div class="share-story-copy">
            <span class="share-card-kicker">Curated showcase</span>
            <h1>${escapeHTML(share.title)}</h1>
            <p>${escapeHTML(share.description)}</p>
            <div class="share-card-meta">${renderMetaChips(share.meta || [])}</div>
          </div>
          <div class="share-card-author share-card-author-premium">
            <img src="${share.author?.avatar || "./logo-source.png"}" alt="${escapeHTML(share.author?.name || "Viby 创作者")}" />
            <div>
              <strong>${escapeHTML(share.author?.name || "Viby 创作者")}</strong>
              <small>${escapeHTML(share.author?.handle || "@creator")}</small>
            </div>
          </div>
          <div class="share-stat-grid">
            <div class="share-stat-card"><strong>${formatNumber(share.stats?.likes)}</strong><span>Likes</span></div>
            <div class="share-stat-card"><strong>${formatNumber(share.stats?.views)}</strong><span>Visits</span></div>
            <div class="share-stat-card"><strong>${escapeHTML(formatDate(share.createdAt) || "Today")}</strong><span>Published</span></div>
          </div>
          ${renderRiskList(linkReasons)}
          <div class="share-platform-banner">
            <div>
              <span>Discover more on Viby</span>
              <strong>${escapeHTML(getPlatformLabel(share))}</strong>
            </div>
            <a href="./index.html">打开 Viby</a>
          </div>
          <div class="share-card-links share-card-links-premium">
            ${share.primaryUrl ? `<a href="${share.primaryUrl}" target="_blank" rel="noreferrer noopener nofollow" data-safe-link="primary">${escapeHTML(share.primaryLabel || "访问作品")}</a>` : ""}
            ${share.github ? `<a href="${share.github}" target="_blank" rel="noreferrer noopener nofollow" data-safe-link="github">查看 GitHub</a>` : ""}
          </div>
          <div class="share-card-foot">Shared via ${escapeHTML(getPlatformLabel(share))}</div>
        </div>
      </div>
    </div>
  `;
};

const renderProfileShare = (share) => {
  shareSurface.innerHTML = `
    <div class="share-composition share-composition-profile">
      ${renderBrandRail(share, "Hosted on Viby")}
      <div class="share-profile-hero">
        <div class="share-profile-identity">
          <img class="share-profile-avatar" src="${share.author?.avatar || "./logo-source.png"}" alt="${escapeHTML(share.author?.name || "创作者")}" />
          <div class="share-profile-copy">
            <span class="share-card-kicker">Creator profile</span>
            <h1>${escapeHTML(share.title)}</h1>
            <p>${escapeHTML(share.description)}</p>
            <small>${escapeHTML(share.author?.handle || "@creator")}</small>
          </div>
        </div>
        <div class="share-profile-stats share-profile-stats-premium">
          <span><strong>${formatNumber(share.stats?.works)}</strong>作品</span>
          <span><strong>${formatNumber(share.stats?.views)}</strong>浏览</span>
          <span><strong>${formatNumber(share.stats?.likes)}</strong>赞</span>
        </div>
      </div>
      <div class="share-profile-grid share-profile-grid-premium">
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
      <div class="share-platform-banner">
        <div>
          <span>Discover more on Viby</span>
          <strong>${escapeHTML(getPlatformLabel(share))}</strong>
        </div>
        <a href="./index.html">打开 Viby</a>
      </div>
      <div class="share-card-links share-card-links-premium">
        ${share.libraryUrl ? `<a href="${share.libraryUrl}">查看作品库</a>` : ""}
      </div>
      <div class="share-card-foot">Creator profile shared via ${escapeHTML(getPlatformLabel(share))}</div>
    </div>
  `;
};

const renderShare = (share) => {
  activeShareRecord = share;
  const template = safeTrim(share.template) || "aurora";
  shareSurface.className = `share-surface share-template-${template}`;
  if (sharePageLegalNote) {
    sharePageLegalNote.textContent =
      safeTrim(share.legalNotice) ||
      "Viby 仅提供作品展示入口，不对第三方站点的合法性、安全性、真实性或交易结果作保证。请勿在陌生页面输入密码、验证码、银行卡、助记词或私钥。";
  }
  if (share.kind === "profile") {
    renderProfileShare(share);
    activateShareMediaFallbacks();
    return;
  }
  renderWorkShare(share);
  activateShareMediaFallbacks();
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

const checkUrlSafetyLive = async (url, kind = "primary") => {
  const response = await fetch("/api/safety/url-check", {
    method: "POST",
    credentials: "same-origin",
    cache: "no-store",
    headers: { "Content-Type": "application/json", "X-Requested-With": "fetch" },
    body: JSON.stringify({ url, kind, linkType: kind === "github" ? "github" : "website" }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "安全检测失败");
  return payload;
};

shareSurface?.addEventListener("click", (event) => {
  const anchor = event.target.closest("[data-safe-link]");
  if (!anchor) return;
  const kind = safeTrim(anchor.dataset.safeLink) || "primary";
  const context = buildLinkGuardContext(kind);
  if (!context) return;
  event.preventDefault();
  void (async () => {
    try {
      const liveSafety = await checkUrlSafetyLive(context.url, kind);
      context.reasons = [...new Set([...(context.reasons || []), ...((liveSafety.reasons || []).map((item) => safeTrim(item)).filter(Boolean))])];
      context.shouldGuard =
        context.shouldGuard || ["blocked", "malicious", "caution"].includes(safeTrim(liveSafety.status || "").toLowerCase());
    } catch (error) {
      console.warn("[viby] share live url safety check failed", error);
    }

    if (context.shouldGuard) {
      activeLinkGuardContext = context;
      renderLinkGuard(context);
      linkGuardOverlay?.classList.add("is-open");
      linkGuardOverlay?.setAttribute("aria-hidden", "false");
      return;
    }
    openOutboundLink(context.url);
  })();
});

closeLinkGuardButtons.forEach((button) => button.addEventListener("click", closeLinkGuard));

linkGuardOverlay?.addEventListener("click", (event) => {
  if (event.target === linkGuardOverlay) closeLinkGuard();
});

confirmLinkGuardButton?.addEventListener("click", () => {
  if (!activeLinkGuardContext?.url) return;
  openOutboundLink(activeLinkGuardContext.url);
  closeLinkGuard();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLinkGuard();
});

void loadShare();
