import { listenPlayers, listenTeams } from "./firestore-service.js";
import { playerCardHtml } from "./component-cards.js";
import { emptyStateHtml, spinnerHtml, escapeHtml } from "./ui-helpers.js";

export function renderPlayers(container) {
  let players = null;
  let teams = null;
  let filter = "all";

  function paint() {
    const filtered = (players || []).filter((p) => filter === "all" || p.teamId === filter);
    container.innerHTML = `
      <div class="container" style="padding:32px 0;">
        <div class="section-head" style="flex-wrap:wrap;gap:12px;">
          <h1 class="section-title">بازیکنان</h1>
          <select id="team-filter" class="input-field" style="max-width:260px;">
            <option value="all">همه تیم‌ها</option>
            ${(teams || []).map((t) => `<option value="${escapeHtml(t.id)}" ${filter === t.id ? "selected" : ""}>${escapeHtml(t.name)}</option>`).join("")}
          </select>
        </div>
        ${players === null ? spinnerHtml()
          : filtered.length === 0 ? emptyStateHtml("بازیکنی یافت نشد")
          : `<div class="grid grid-3">${filtered.map((p) => playerCardHtml(p)).join("")}</div>`}
      </div>
    `;
    const select = container.querySelector("#team-filter");
    if (select) select.addEventListener("change", (e) => { filter = e.target.value; paint(); });
  }

  paint();
  const u1 = listenPlayers((d) => { players = d; paint(); });
  const u2 = listenTeams((d) => { teams = d; paint(); });
  return () => { u1(); u2(); };
}
