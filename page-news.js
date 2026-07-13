import { listenNews } from "./firestore-service.js";
import { newsCardHtml } from "./component-news-card.js";
import { emptyStateHtml, spinnerHtml } from "./ui-helpers.js";

export function renderNews(container) {
  let news = null;

  function paint() {
    container.innerHTML = `
      <div class="container" style="padding:32px 0;">
        <h1 class="section-title" style="margin-bottom:24px;">اخبار و اطلاعیه‌ها</h1>
        ${news === null ? spinnerHtml()
          : news.length === 0 ? emptyStateHtml("خبری منتشر نشده")
          : `<div class="grid grid-3">${news.map((n) => newsCardHtml(n)).join("")}</div>`}
      </div>
    `;
  }

  paint();
  const unsub = listenNews((d) => { news = d; paint(); });
  return unsub;
}
