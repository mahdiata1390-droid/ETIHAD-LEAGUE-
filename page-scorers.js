import { listenPlayers } from "./firestore-service.js";
import { computeTopScorers } from "./standings.js";
import { playerPhotoHtml, emptyStateHtml, spinnerHtml, escapeHtml } from "./ui-helpers.js";

export function renderScorers(container) {
  let players = null;

  function paint() {
    const sorted = players === null ? [] : computeTopScorers(players);
    container.innerHTML = `
      <div class="container" style="padding:32px 0;">
        <h1 class="section-title" style="margin-bottom:24px;">جدول گلزنان</h1>
        ${players === null ? spinnerHtml()
          : sorted.length === 0 ? emptyStateHtml("هنوز گلی ثبت نشده")
          : `<div class="glass-card" style="padding:0;overflow:hidden;">
              ${sorted.map((p, i) => `
                <a href="#/players/${escapeHtml(p.id)}">
                  <div class="scorer-row">
                    <span class="rank-badge ${i === 0 ? "first" : i < 3 ? "top3" : ""}">${i + 1}</span>
                    ${playerPhotoHtml(p.photoUrl, p.name, 44)}
                    <div class="info">
                      <p style="font-weight:600;">${escapeHtml(p.name)}</p>
                      <p style="font-size:12px;color:var(--text-muted);">${escapeHtml(p.teamName || "")}</p>
                    </div>
                    <span class="scorer-goals gold-text">${p.stats.goals}</span>
                  </div>
                </a>
              `).join("")}
            </div>`}
      </div>
    `;
  }

  paint();
  const unsub = listenPlayers((d) => { players = d; paint(); });
  return unsub;
}
