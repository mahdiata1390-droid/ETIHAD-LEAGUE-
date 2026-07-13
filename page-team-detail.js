import { getTeam, listenPlayers, listenMatches, listenTeams } from "./firestore-service.js";
import { computeStandings } from "./standings.js";
import { teamLogoHtml, emptyStateHtml, spinnerHtml, escapeHtml } from "./ui-helpers.js";
import { playerCardHtml } from "./component-cards.js";
import { matchCardHtml, attachMatchCardEvents } from "./component-match-card.js";

export async function renderTeamDetail(container, params) {
  const teamId = params.id;
  let team, players = null, matches = null, allTeams = null;

  team = await getTeam(teamId);
  if (!team) {
    container.innerHTML = `<div class="container" style="padding:32px 0;">${emptyStateHtml("تیم یافت نشد")}</div>`;
    return;
  }

  function paint() {
    if (players === null || matches === null || allTeams === null) {
      container.innerHTML = `<div class="container" style="padding:32px 0;">${spinnerHtml()}</div>`;
      return;
    }
    const teamMatches = matches
      .filter((m) => m.homeTeamId === teamId || m.awayTeamId === teamId)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 6);
    const stats = computeStandings(allTeams, matches).find((r) => r.teamId === teamId);

    container.innerHTML = `
      <div class="container" style="padding:32px 0;">
        <div class="glass-panel fade-up" style="padding:32px;display:flex;flex-wrap:wrap;align-items:center;gap:24px;margin-bottom:40px;">
          ${teamLogoHtml(team.logoUrl, team.name, 100)}
          <div style="flex:1;min-width:200px;text-align:center;">
            <h1 class="gold-text" style="font-size:26px;font-weight:800;margin:0 0 4px;">${escapeHtml(team.name)}</h1>
            ${team.city ? `<p style="color:var(--text-muted);font-size:14px;">${escapeHtml(team.city)}</p>` : ""}
          </div>
          ${stats ? `
            <div class="grid grid-4" style="flex:1;min-width:260px;">
              <div class="glass-card stat-box"><p class="value">${stats.played}</p><p class="label">بازی</p></div>
              <div class="glass-card stat-box"><p class="value">${stats.won}</p><p class="label">برد</p></div>
              <div class="glass-card stat-box"><p class="value gold-text">${stats.points}</p><p class="label">امتیاز</p></div>
              <div class="glass-card stat-box"><p class="value">${stats.goalDiff}</p><p class="label">تفاضل گل</p></div>
            </div>` : ""}
        </div>

        <section class="section" style="margin-top:0;">
          <h2 class="section-title" style="margin-bottom:16px;">بازیکنان</h2>
          ${players.length === 0 ? emptyStateHtml("بازیکنی برای این تیم ثبت نشده")
            : `<div class="grid grid-3">${players.map((p) => playerCardHtml(p)).join("")}</div>`}
        </section>

        <section class="section">
          <h2 class="section-title" style="margin-bottom:16px;">آخرین مسابقات</h2>
          ${teamMatches.length === 0 ? emptyStateHtml("مسابقه‌ای ثبت نشده")
            : `<div class="grid grid-3">${teamMatches.map((m) => matchCardHtml(m)).join("")}</div>`}
        </section>
      </div>
    `;
    attachMatchCardEvents(container);
  }

  paint();
  const u1 = listenPlayers((d) => { players = d; paint(); }, teamId);
  const u2 = listenMatches((d) => { matches = d; paint(); });
  const u3 = listenTeams((d) => { allTeams = d; paint(); });
  return () => { u1(); u2(); u3(); };
}
