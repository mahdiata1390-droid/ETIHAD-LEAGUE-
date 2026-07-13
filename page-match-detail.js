import { getMatch } from "./firestore-service.js";
import { teamLogoHtml, statusBadge, emptyStateHtml, escapeHtml } from "./ui-helpers.js";
import { toJalali } from "./date-utils.js";

export async function renderMatchDetail(container, params) {
  const match = await getMatch(params.id);
  if (!match) {
    container.innerHTML = `<div class="container" style="padding:32px 0;">${emptyStateHtml("مسابقه یافت نشد")}</div>`;
    return;
  }

  const finished = match.status === "finished";

  container.innerHTML = `
    <div class="container" style="padding:32px 0;max-width:720px;margin:0 auto;">
      <div class="glass-panel fade-up" style="padding:32px;margin-bottom:32px;">
        <div style="display:flex;justify-content:center;margin-bottom:16px;">${statusBadge(match.status)}</div>
        <div class="match-card-teams">
          <div class="match-team">
            ${teamLogoHtml(match.homeTeamLogo, match.homeTeamName, 72)}
            <span class="name" style="font-weight:700;">${escapeHtml(match.homeTeamName)}</span>
          </div>
          <div class="${finished ? "match-score gold-text" : "match-vs"}" style="font-size:${finished ? "36px" : "24px"};">
            ${finished ? `${match.homeScore} - ${match.awayScore}` : "VS"}
          </div>
          <div class="match-team">
            ${teamLogoHtml(match.awayTeamLogo, match.awayTeamName, 72)}
            <span class="name" style="font-weight:700;">${escapeHtml(match.awayTeamName)}</span>
          </div>
        </div>
        <div style="text-align:center;font-size:14px;color:var(--text-muted);margin-top:24px;">
          <p>${toJalali(match.date)} — ساعت ${escapeHtml(match.time || "")}</p>
          ${match.venue ? `<p>📍 ${escapeHtml(match.venue)}</p>` : ""}
        </div>
      </div>

      ${finished ? `
        <div class="grid grid-2">
          <div class="glass-card">
            <h3 style="color:var(--gold-light);margin:0 0 12px;">⚽ گلزنان</h3>
            ${(match.goals || []).length ? `
              <ul style="list-style:none;padding:0;margin:0;font-size:14px;">
                ${match.goals.map((g) => `
                  <li style="display:flex;justify-content:space-between;color:var(--text);margin-bottom:8px;">
                    <span>${escapeHtml(g.playerName)}${g.assistPlayerName ? ` (پاس: ${escapeHtml(g.assistPlayerName)})` : ""}</span>
                    ${g.minute ? `<span style="color:var(--text-faint);">'${g.minute}</span>` : ""}
                  </li>
                `).join("")}
              </ul>
            ` : `<p style="color:var(--text-faint);font-size:14px;">گلی ثبت نشده</p>`}
          </div>

          <div class="glass-card">
            <h3 style="color:var(--gold-light);margin:0 0 12px;">🟨🟥 کارت‌ها</h3>
            ${(match.cards || []).length ? `
              <ul style="list-style:none;padding:0;margin:0;font-size:14px;">
                ${match.cards.map((c) => `
                  <li style="display:flex;justify-content:space-between;color:var(--text);margin-bottom:8px;">
                    <span>${c.type === "yellow" ? "🟨" : "🟥"} ${escapeHtml(c.playerName)}</span>
                    ${c.minute ? `<span style="color:var(--text-faint);">'${c.minute}</span>` : ""}
                  </li>
                `).join("")}
              </ul>
            ` : `<p style="color:var(--text-faint);font-size:14px;">کارتی ثبت نشده</p>`}
          </div>

          ${match.manOfTheMatchName ? `
            <div class="glass-card" style="grid-column:1/-1;text-align:center;">
              <h3 style="color:var(--gold-light);margin:0 0 8px;">🏅 بهترین بازیکن مسابقه</h3>
              <p style="font-size:18px;font-weight:700;">${escapeHtml(match.manOfTheMatchName)}</p>
            </div>
          ` : ""}
        </div>
      ` : ""}
    </div>
  `;
}
