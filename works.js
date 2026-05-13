const grid = document.querySelector("#allWorksGrid");
const pageButtons = document.querySelectorAll("[data-page]");
const paginationGuide = document.querySelector("#paginationGuide");
const storageKey = "viby-works";
const oneDay = 24 * 60 * 60 * 1000;
let currentPage = 1;

const seedWorks = [
  ["灵感卡片", "把一个产品想法整理成清晰的功能卡片和首屏文案。", "app", 42, 1280, 2],
  ["Form Echo", "给独立开发者用的轻量反馈收集组件。", "website", 67, 2104, 13],
  ["Tiny Invoice", "输入项目和金额，一键生成漂亮发票页面。", "website", 31, 1416, 35],
  ["Launch Desk", "整理发布清单、素材和复盘记录。", "website", 29, 842, 4],
  ["Habit Pulse", "一个轻量习惯追踪 APP，用柔和图表展示进展。", "app", 25, 733, 5],
  ["Note Garden", "把零散笔记变成可检索的个人知识花园。", "website", 34, 1012, 8],
  ["Fit Screen", "根据不同设备尺寸快速预览页面视觉效果。", "app", 18, 618, 18],
  ["Copy Room", "为产品页面生成多版本标题、卖点和行动按钮。", "website", 21, 940, 28],
  ["Mood Board", "收集截图和配色，生成一个轻量设计灵感板。", "website", 16, 512, 6],
  ["Focus Bell", "适合远程工作的番茄钟和提醒面板。", "app", 14, 460, 10],
  ["Mini CRM", "给个人创作者管理合作线索的小型客户表。", "website", 13, 386, 11],
  ["Pocket Plan", "把待办、日程和项目计划放进一个极简面板。", "app", 12, 320, 12],
].map(([title, description, category, likes, views, days], index) => ({
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
  createdAt: Date.now() - days * oneDay,
  likes,
  views,
}));

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

const categoryText = (category) => (category === "app" ? "APP" : "网站");

const allWorks = [...getStoredWorks(), ...seedWorks].sort(
  (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
);

const render = () => {
  const start = (currentPage - 1) * 9;
  const works = allWorks.slice(start, start + 9);
  grid.innerHTML = works
    .map(
      (work, index) => `
        <article class="work-card">
          <div class="rank-badge">${start + index + 1}</div>
          <div class="work-visual ${work.cover ? "has-cover" : work.visual}">
            ${work.cover ? `<img src="${work.cover}" alt="${escapeHTML(work.title)} 封面" />` : ""}
          </div>
          <div class="work-content">
            <h3>${escapeHTML(work.title)}</h3>
            <p>${escapeHTML(work.description)}</p>
            <div class="work-meta">
              <span>${escapeHTML(categoryText(work.category))}</span>
              <span>${escapeHTML((work.devices || ["电脑端"]).join(" / "))}</span>
            </div>
            <div class="work-actions">
              <a href="${work.url}" target="_blank" rel="noreferrer">访问作品</a>
              <button type="button">点赞 ${work.likes || 0}</button>
            </div>
          </div>
        </article>
      `,
    )
    .join("");

  const totalPages = Math.ceil(allWorks.length / 9);
  paginationGuide.textContent =
    totalPages > 1
      ? `当前第 ${currentPage} 页，共 ${totalPages} 页。看完后点击下方按钮继续浏览。`
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
