import { listenMatches, listenNews } from "./firestore-service.js";
import { matchCardHtml, attachMatchCardEvents } from "./component-match-card.js";
import { newsCardHtml } from "./component-news-card.js";
import { emptyStateHtml, spinnerHtml } from "./ui-helpers.js";

export function renderHome(container) {
  let matches = null;
  let news = null;

  function paint() {
    const results = (matches || []).filter((m) => m.status === "finished").slice(0, 4);
    const upcoming = (matches || [])
      .filter((m) => m.status === "scheduled")
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 4);
    const newsPreview = (news || []).slice(0, 3);

    container.innerHTML = `
      <div class="container">
        <section class="hero glass-panel fade-up">
          <div class="hero-logo">ا</div>
          <h1 class="gold-text">لیگ اتحاد</h1>
          <p>خانه‌ی فوتبال محلی؛ جدول زنده، نتایج، گلزنان و آخرین اخبار تیم‌های لیگ اتحاد</p>
          <div class="hero-actions">
            <a href="#/standings" class="btn-gold">مشاهده جدول لیگ</a>
            <a href="#/matches" class="btn-outline">مسابقات</a>
          </div>
        </section>

        <section class="section">
          <div class="section-head">
            <h2 class="section-title">آخرین نتایج</h2>
            <a href="#/matches">همه مسابقات ←</a>
          </div>
          ${matches === null ? spinnerHtml() : results.length === 0
            ? emptyStateHtml("هنوز نتیجه‌ای ثبت نشده", "به محض ثبت اولین مسابقه، نتایج اینجا نمایش داده می‌شود.")
            : `<div class="grid grid-4">${results.map((m) => matchCardHtml(m)).join("")}</div>`}
        </section>

        <section class="section">
          <div class="section-head">
            <h2 class="section-title">مسابقات آینده</h2>
            <a href="#/matches">همه مسابقات ←</a>
          </div>
          ${matches === null ? spinnerHtml() : upcoming.length === 0
            ? emptyStateHtml("مسابقه‌ی آینده‌ای برنامه‌ریزی نشده")
            : `<div class="grid grid-4">${upcoming.map((m) => matchCardHtml(m)).join("")}</div>`}
        </section>

        <section class="section" style="margin-bottom:64px;">
          <div class="section-head">
            <h2 class="section-title">اخبار و اطلاعیه‌ها</h2>
            <a href="#/news">همه اخبار ←</a>
          </div>
          ${news === null ? spinnerHtml() : newsPreview.length === 0
            ? emptyStateHtml("خبری منتشر نشده")
            : `<div class="grid grid-3">${newsPreview.map((n) => newsCardHtml(n)).join("")}</div>`}
        </section>
      </div>
    `;
    attachMatchCardEvents(container);
  }

  paint();
  const u1 = listenMatches((data) => { matches = data; paint(); });
  const u2 = listenNews((data) => { news = data; paint(); });

  return () => { u1(); u2(); };
}
