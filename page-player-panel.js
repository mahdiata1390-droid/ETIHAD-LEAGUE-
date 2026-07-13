import { guardPlayer } from "./access-guard.js";
import { authState } from "./auth-state.js";
import { getPlayer, listenMatches } from "./firestore-service.js";
import { playerPhotoHtml, emptyStateHtml, spinnerHtml, escapeHtml } from "./ui-helpers.js";
import { matchCardHtml, attachMatchCardEvents } from "./component-match-card.js";

export function renderPlayerPanel(container) {
  return guardPlayer(container, (el) => renderContent(el));
}

function renderContent(container) {
  let player = undefined;
  let matches = null;
  const playerId = authState.playerId;

  function paint() {
    if (player === undefined || matches === null) {
      container.innerHTML = `<div class="container" style="padding-top:32px;">${spinnerHtml()}</div>`;
      return;
    }
    if (player === null) {
      container.innerHTML = `<div class="container" style="padding-top:32px;">${emptyStateHtml("پروفایل بازیکن یافت نشد")}</div>`;
      return;
    }

    const s = player.stats || { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 };
    const myMatches = matches
      .filter((m) => m.status === "finished" && (m.homeTeamId === player.teamId || m.awayTeamId === player.teamId))
      .slice(0, 6);

    container.innerHTML = `
      <div class="container" style="padding:32px 0;max-width:720px;margin:0 auto;">
        <h1 class="section-title" style="margin-bottom:24px;">پنل بازیکن</h1>

        <div class="glass-panel fade-up" style="padding:32px;display:flex;flex-wrap:wrap;align-items:center;gap:24px;margin-bottom:32px;">
          ${playerPhotoHtml(player.photoUrl, player.name, 100)}
          <div style="flex:1;min-width:200px;text-align:center;">
            <h2 class="gold-text" style="font-size:22px;font-weight:800;margin:0 0 4px;">${escapeHtml(player.name)}</h2>
            <p style="color:var(--text-muted);font-size:14px;">${escapeHtml(player.teamName || "")} · ${escapeHtml(player.position || "")} · پیراهن #${escapeHtml(player.shirtNumber)}</p>
          </div>
        </div>

        <div class="grid grid-5" style="margin-bottom:40px;">
          <div class="glass-card stat-box"><p class="value">${s.matches}</p><p class="label">بازی</p></div>
          <div class="glass-card stat-box"><p class="value gold-text">${s.goals}</p><p class="label">گل</p></div>
          <div class="glass-card stat-box"><p class="value">${s.assists}</p><p class="label">پاس گل</p></div>
          <div class="glass-card stat-box"><p class="value" style="color:var(--yellow);">${s.yellowCards}</p><p class="label">کارت زرد</p></div>
          <div class="glass-card stat-box"><p class="value" style="color:var(--red);">${s.redCards}</p><p class="label">کارت قرمز</p></div>
        </div>

        <h2 class="section-title" style="margin-bottom:16px;">آخرین مسابقات تیم شما</h2>
        ${myMatches.length === 0 ? emptyStateHtml("مسابقه‌ای ثبت نشده")
          : `<div class="grid grid-2">${myMatches.map((m) => matchCardHtml(m)).join("")}</div>`}

        <p style="font-size:12px;color:var(--text-faint);text-align:center;margin-top:40px;">
          شما فقط می‌توانید اطلاعات خود را مشاهده کنید. برای هرگونه تغییر با مدیر لیگ تماس بگیرید.
        </p>
      </div>
    `;
    attachMatchCardEvents(container);
  }

  paint();
  if (playerId) getPlayer(playerId).then((p) => { player = p; paint(); });
  const unsub = listenMatches((d) => { matches = d; paint(); });
  return unsub;
}
