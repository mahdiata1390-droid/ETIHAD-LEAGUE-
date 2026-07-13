import { teamLogoHtml, escapeHtml } from "./ui-helpers.js";

export function standingsTableHtml(rows) {
  return `
    <div class="glass-card table-wrap">
      <table>
        <thead>
          <tr>
            <th>رتبه</th><th>تیم</th><th>بازی</th><th>برد</th><th>مساوی</th>
            <th>باخت</th><th>گل زده</th><th>گل خورده</th><th>تفاضل</th><th>امتیاز</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((r, i) => `
            <tr class="${i < 3 ? "top3" : ""}">
              <td><span class="rank-badge ${i === 0 ? "first" : i < 3 ? "top3" : ""}">${i + 1}</span></td>
              <td>
                <a href="#/teams/${escapeHtml(r.teamId)}" class="team-cell">
                  ${teamLogoHtml(r.logoUrl, r.teamName, 30)}
                  <span style="font-weight:600;">${escapeHtml(r.teamName)}</span>
                </a>
              </td>
              <td>${r.played}</td>
              <td style="color:var(--green);">${r.won}</td>
              <td style="color:var(--text-muted);">${r.drawn}</td>
              <td style="color:var(--red);">${r.lost}</td>
              <td>${r.goalsFor}</td>
              <td>${r.goalsAgainst}</td>
              <td>${r.goalDiff > 0 ? `+${r.goalDiff}` : r.goalDiff}</td>
              <td class="points-cell gold-text">${r.points}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}
