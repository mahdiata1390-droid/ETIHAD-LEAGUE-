import { teamLogoHtml, statusBadge, escapeHtml } from "./ui-helpers.js";
import { toJalali } from "./date-utils.js";

export function matchCardHtml(match) {
  const finished = match.status === "finished";
  return `
    <div class="glass-card match-card" data-match-id="${escapeHtml(match.id)}">
      <div class="match-card-top">
        <span>${toJalali(match.date)} — ${escapeHtml(match.time || "")}</span>
        ${statusBadge(match.status)}
      </div>
      <div class="match-card-teams">
        <div class="match-team">
          ${teamLogoHtml(match.homeTeamLogo, match.homeTeamName, 44)}
          <span class="name">${escapeHtml(match.homeTeamName)}</span>
        </div>
        <div class="${finished ? "match-score gold-text" : "match-vs"}">
          ${finished ? `${match.homeScore} - ${match.awayScore}` : "VS"}
        </div>
        <div class="match-team">
          ${teamLogoHtml(match.awayTeamLogo, match.awayTeamName, 44)}
          <span class="name">${escapeHtml(match.awayTeamName)}</span>
        </div>
      </div>
      ${match.venue ? `<p class="match-venue">📍 ${escapeHtml(match.venue)}</p>` : ""}
    </div>
  `;
}

/** روی کانتینر باید بعد از هر بار innerHTML صدا زده شود تا کلیک روی کارت‌ها فعال شود */
export function attachMatchCardEvents(container) {
  container.querySelectorAll(".match-card[data-match-id]").forEach((el) => {
    el.addEventListener("click", () => {
      window.location.hash = `#/matches/${el.dataset.matchId}`;
    });
  });
}
