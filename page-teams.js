import { listenTeams } from "./firestore-service.js";
import { teamCardHtml } from "./component-cards.js";
import { emptyStateHtml, spinnerHtml } from "./ui-helpers.js";

export function renderTeams(container) {
  let teams = null;

  function paint() {
    container.innerHTML = `
      <div class="container" style="padding:32px 0;">
        <h1 class="section-title" style="margin-bottom:24px;">تیم‌های لیگ اتحاد</h1>
        ${teams === null ? spinnerHtml()
          : teams.length === 0 ? emptyStateHtml("هنوز تیمی ثبت نشده")
          : `<div class="grid grid-5">${teams.map((t) => teamCardHtml(t)).join("")}</div>`}
      </div>
    `;
  }

  paint();
  const unsub = listenTeams((d) => { teams = d; paint(); });
  return unsub;
}
