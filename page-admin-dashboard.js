import { guardAdmin } from "./access-guard.js";

const sections = [
  { href: "#/admin/teams", title: "مدیریت تیم‌ها", desc: "افزودن، ویرایش و حذف تیم و لوگو", icon: "🛡️" },
  { href: "#/admin/players", title: "مدیریت بازیکنان", desc: "افزودن، ویرایش و حذف بازیکن و عکس", icon: "👤" },
  { href: "#/admin/matches", title: "مدیریت مسابقات", desc: "ایجاد مسابقه و ثبت نتیجه، گل و کارت", icon: "⚽" },
  { href: "#/admin/news", title: "مدیریت اخبار", desc: "انتشار خبر و اطلاعیه", icon: "📰" }
];

export function renderAdminDashboard(container) {
  return guardAdmin(container, (el) => {
    el.innerHTML = `
      <div class="container" style="padding:32px 0;">
        <h1 class="section-title" style="margin-bottom:24px;">پنل مدیریت لیگ اتحاد</h1>
        <div class="grid grid-2">
          ${sections.map((s) => `
            <a href="${s.href}">
              <div class="glass-card dash-card">
                <span class="icon">${s.icon}</span>
                <div>
                  <p class="title">${s.title}</p>
                  <p class="desc">${s.desc}</p>
                </div>
              </div>
            </a>
          `).join("")}
        </div>
      </div>
    `;
  });
}
