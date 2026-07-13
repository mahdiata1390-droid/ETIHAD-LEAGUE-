// روتر ساده مبتنی بر هش، مناسب برای میزبانی استاتیک بدون نیاز به تنظیمات سرور
const routes = [];

/** ثبت یک مسیر. الگو می‌تواند شامل پارامتر باشد، مثل "/teams/:id" */
export function registerRoute(pattern, handler) {
  const paramNames = [];
  const regexStr = pattern
    .replace(/\/:([^/]+)/g, (_, name) => {
      paramNames.push(name);
      return "/([^/]+)";
    });
  const regex = new RegExp(`^${regexStr}/?$`);
  routes.push({ regex, paramNames, handler });
}

function parseHash() {
  const hash = window.location.hash.slice(1) || "/";
  const [path] = hash.split("?");
  return path || "/";
}

let currentCleanup = null;

export async function renderRoute() {
  const path = parseHash();
  const appEl = document.getElementById("app-content");
  if (!appEl) return;

  if (typeof currentCleanup === "function") {
    try { currentCleanup(); } catch (e) { /* noop */ }
    currentCleanup = null;
  }

  for (const route of routes) {
    const match = path.match(route.regex);
    if (match) {
      const params = {};
      route.paramNames.forEach((name, i) => { params[name] = decodeURIComponent(match[i + 1]); });
      appEl.innerHTML = spinnerHtmlInline();
      const cleanup = await route.handler(appEl, params);
      if (typeof cleanup === "function") currentCleanup = cleanup;
      window.scrollTo(0, 0);
      document.dispatchEvent(new CustomEvent("route-changed", { detail: { path } }));
      return;
    }
  }

  appEl.innerHTML = `
    <div class="container" style="padding-top:32px;">
      <div class="glass-panel access-denied" style="padding:40px;">
        <div class="gold-text" style="font-size:36px;font-weight:800;">۴۰۴</div>
        <p style="font-weight:700;margin:8px 0;">صفحه یافت نشد</p>
        <p style="color:var(--text-muted);font-size:14px;margin-bottom:20px;">صفحه‌ی مورد نظر شما وجود ندارد.</p>
        <a href="#/" class="btn-gold">بازگشت به خانه</a>
      </div>
    </div>
  `;
}

function spinnerHtmlInline() {
  return `<div class="container" style="padding-top:32px;"><div class="spinner"></div></div>`;
}

export function initRouter() {
  window.addEventListener("hashchange", renderRoute);
  if (!window.location.hash) window.location.hash = "#/";
  renderRoute();
}

export function navigate(path) {
  window.location.hash = `#${path}`;
}
