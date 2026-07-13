import { getPlayer } from "./firestore-service.js";
import { playerPhotoHtml, emptyStateHtml, escapeHtml } from "./ui-helpers.js";

export async function renderPlayerDetail(container, params) {
  const player = await getPlayer(params.id);
  if (!player) {
    container.innerHTML = `<div class="container" style="padding:32px 0;">${emptyStateHtml("بازیکن یافت نشد")}</div>`;
    return;
  }
  const s = player.stats || { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 };

  container.innerHTML = `
    <div class="container" style="padding:32px 0;max-width:720px;margin:0 auto;">
      <div class="glass-panel fade-up" style="padding:32px;display:flex;flex-wrap:wrap;align-items:center;gap:24px;margin-bottom:32px;">
        ${playerPhotoHtml(player.photoUrl, player.name, 110)}
        <div style="flex:1;min-width:200px;text-align:center;">
          <h1 class="gold-text" style="font-size:24px;font-weight:800;margin:0 0 4px;">${escapeHtml(player.name)}</h1>
          <p style="color:var(--text-muted);font-size:14px;">${escapeHtml(player.teamName || "")} · ${escapeHtml(player.position || "")}</p>
        </div>
        <div class="shirt-number" style="width:56px;height:56px;font-size:20px;">${escapeHtml(player.shirtNumber)}</div>
      </div>

      <div class="grid grid-5">
        <div class="glass-card stat-box"><p class="value">${s.matches}</p><p class="label">بازی</p></div>
        <div class="glass-card stat-box"><p class="value gold-text">${s.goals}</p><p class="label">گل</p></div>
        <div class="glass-card stat-box"><p class="value">${s.assists}</p><p class="label">پاس گل</p></div>
        <div class="glass-card stat-box"><p class="value" style="color:var(--yellow);">${s.yellowCards}</p><p class="label">کارت زرد</p></div>
        <div class="glass-card stat-box"><p class="value" style="color:var(--red);">${s.redCards}</p><p class="label">کارت قرمز</p></div>
      </div>
    </div>
  `;
}
