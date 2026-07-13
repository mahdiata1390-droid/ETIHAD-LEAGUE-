import { authState, onAuthChange } from "./auth-state.js";
import { spinnerHtml } from "./ui-helpers.js";

function deniedHtml(message) {
  return `
    <div class="container" style="padding-top:32px;">
      <div class="glass-card access-denied" style="padding:32px;">
        <p style="font-weight:700;font-size:18px;margin-bottom:8px;">دسترسی محدود</p>
        <p style="color:var(--text-muted);font-size:14px;margin-bottom:20px;">${message}</p>
        <a href="#/login" class="btn-gold">ورود</a>
      </div>
    </div>
  `;
}

/**
 * فقط در صورتی که کاربر مدیر باشد، renderFn را اجرا می‌کند.
 * تا زمانی که وضعیت ورود مشخص نشده، اسپینر نمایش داده می‌شود.
 */
export function guardAdmin(container, renderFn) {
  let cleanup = null;

  function check() {
    if (authState.loading) {
      container.innerHTML = `<div class="container" style="padding-top:32px;">${spinnerHtml()}</div>`;
      return;
    }
    if (authState.role !== "admin") {
      container.innerHTML = deniedHtml("این بخش فقط برای مدیر لیگ در دسترس است.");
      return;
    }
    if (typeof cleanup === "function") cleanup();
    cleanup = renderFn(container);
  }

  check();
  const unsub = onAuthChange(check);
  return () => {
    unsub();
    if (typeof cleanup === "function") cleanup();
  };
}

export function guardPlayer(container, renderFn) {
  let cleanup = null;

  function check() {
    if (authState.loading) {
      container.innerHTML = `<div class="container" style="padding-top:32px;">${spinnerHtml()}</div>`;
      return;
    }
    if (authState.role !== "player") {
      container.innerHTML = deniedHtml("این بخش فقط برای بازیکنانی که وارد حساب خود شده‌اند در دسترس است.");
      return;
    }
    if (typeof cleanup === "function") cleanup();
    cleanup = renderFn(container);
  }

  check();
  const unsub = onAuthChange(check);
  return () => {
    unsub();
    if (typeof cleanup === "function") cleanup();
  };
}
