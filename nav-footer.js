import { authState, onAuthChange, logout } from "./auth-state.js";

const NAV_LINKS = [
  { href: "#/", label: "خانه" },
  { href: "#/standings", label: "جدول لیگ" },
  { href: "#/teams", label: "تیم‌ها" },
  { href: "#/players", label: "بازیکنان" },
  { href: "#/matches", label: "مسابقات" },
  { href: "#/scorers", label: "گلزنان" },
  { href: "#/news", label: "اخبار" }
];

function currentPath() {
  return window.location.hash.slice(1).split("?")[0] || "/";
}

function navLinksHtml(mobile = false) {
  const path = currentPath();
  return NAV_LINKS.map((l) => {
    const hrefPath = l.href.slice(1);
    const active = hrefPath === path;
    return `<a class="nav-link ${active ? "active" : ""}" href="${l.href}">${l.label}</a>`;
  }).join("");
}

function actionsHtml() {
  const { role, user } = authState;
  let extra = "";
  if (role === "admin") extra = `<a href="#/admin" class="btn-outline" style="padding:8px 16px;font-size:14px;">پنل مدیر</a>`;
  else if (role === "player") extra = `<a href="#/player-panel" class="btn-outline" style="padding:8px 16px;font-size:14px;">پنل بازیکن</a>`;

  const authBtn = user
    ? `<button id="logout-btn" class="btn-gold" style="padding:8px 16px;font-size:14px;">خروج</button>`
    : `<a href="#/login" class="btn-gold" style="padding:8px 16px;font-size:14px;">ورود</a>`;

  return extra + authBtn;
}

export function renderHeader(root) {
  function paint() {
    root.innerHTML = `
      <header class="glass-card header">
        <div class="header-row">
          <a href="#/" class="brand">
            <span class="brand-logo">ا</span>
            <span class="brand-name gold-text">لیگ اتحاد</span>
          </a>
          <nav class="nav-desktop">${navLinksHtml()}</nav>
          <div class="header-actions">${actionsHtml()}</div>
          <button class="menu-toggle" id="menu-toggle" aria-label="منو">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 7h16M4 12h16M4 17h16" stroke-linecap="round" />
            </svg>
          </button>
        </div>
        <nav class="nav-mobile" id="nav-mobile">
          ${navLinksHtml(true)}
          <div class="nav-mobile-actions">${actionsHtml()}</div>
        </nav>
      </header>
    `;

    root.querySelector("#menu-toggle").addEventListener("click", () => {
      root.querySelector("#nav-mobile").classList.toggle("open");
    });
    const logoutBtns = root.querySelectorAll("#logout-btn");
    logoutBtns.forEach((btn) => btn.addEventListener("click", async () => {
      await logout();
      window.location.hash = "#/";
    }));
  }

  paint();
  onAuthChange(paint);
  window.addEventListener("hashchange", paint);
}

export function renderFooter(root) {
  root.innerHTML = `
    <footer class="footer">
      <div class="glass-card footer-inner">
        <p>© ${new Date().getFullYear()} لیگ اتحاد — تمامی حقوق محفوظ است.</p>
        <p class="gold-text" style="font-weight:700;">Ettehad League</p>
      </div>
    </footer>
  `;
}
