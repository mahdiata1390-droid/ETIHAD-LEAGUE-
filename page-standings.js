import { listenTeams, listenMatches } from "./firestore-service.js";
import { computeStandings } from "./standings.js";
import { standingsTableHtml } from "./component-standings-table.js";
import { emptyStateHtml, spinnerHtml } from "./ui-helpers.js";

export function renderStandings(container) {
  let teams = null;
  let matches = null;

  function paint() {
    container.innerHTML = `
      <div class="container" style="padding:32px 0;">
        <h1 class="section-title" style="margin-bottom:24px;">جدول لیگ اتحاد</h1>
        ${teams === null || matches === null ? spinnerHtml()
          : teams.length === 0 ? emptyStateHtml("هنوز تیمی ثبت نشده", "پس از افزودن تیم‌ها، جدول اینجا نمایش داده می‌شود.")
          : standingsTableHtml(computeStandings(teams, matches))}
      </div>
    `;
  }

  paint();
  const u1 = listenTeams((d) => { teams = d; paint(); });
  const u2 = listenMatches((d) => { matches = d; paint(); });
  return () => { u1(); u2(); };
}
