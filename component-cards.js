import { teamLogoHtml, playerPhotoHtml, escapeHtml } from "./ui-helpers.js";

export function teamCardHtml(team) {
  return `
    <a href="#/teams/${escapeHtml(team.id)}">
      <div class="glass-card team-card">
        ${teamLogoHtml(team.logoUrl, team.name, 72)}
        <div>
          <p style="font-weight:700;">${escapeHtml(team.name)}</p>
          ${team.city ? `<p style="font-size:12px;color:var(--text-muted);margin-top:2px;">${escapeHtml(team.city)}</p>` : ""}
        </div>
      </div>
    </a>
  `;
}

export function playerCardHtml(player) {
  return `
    <a href="#/players/${escapeHtml(player.id)}">
      <div class="glass-card player-card">
        ${playerPhotoHtml(player.photoUrl, player.name, 56)}
        <div class="info">
          <p class="name">${escapeHtml(player.name)}</p>
          <p class="meta">${escapeHtml(player.teamName || "")} · ${escapeHtml(player.position || "")}</p>
        </div>
        <span class="shirt-number">${escapeHtml(player.shirtNumber)}</span>
      </div>
    </a>
  `;
}
