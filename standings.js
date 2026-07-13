/**
 * جدول لیگ همیشه به‌صورت زنده و از روی نتایج مسابقات محاسبه می‌شود.
 * هیچ داده‌ی تکراری ذخیره نمی‌شود؛ بنابراین جدول همیشه با واقعیت مسابقات هم‌خوان است.
 */
export function computeStandings(teams, matches) {
  const table = new Map();

  teams.forEach((team) => {
    table.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      logoUrl: team.logoUrl,
      played: 0, won: 0, drawn: 0, lost: 0,
      goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0
    });
  });

  const finished = matches.filter((m) => m.status === "finished" && m.homeScore != null && m.awayScore != null);

  for (const m of finished) {
    const home = table.get(m.homeTeamId);
    const away = table.get(m.awayTeamId);
    if (!home || !away) continue;

    const hs = m.homeScore, as = m.awayScore;
    home.played += 1; away.played += 1;
    home.goalsFor += hs; home.goalsAgainst += as;
    away.goalsFor += as; away.goalsAgainst += hs;

    if (hs > as) { home.won += 1; away.lost += 1; home.points += 3; }
    else if (hs < as) { away.won += 1; home.lost += 1; away.points += 3; }
    else { home.drawn += 1; away.drawn += 1; home.points += 1; away.points += 1; }
  }

  const rows = Array.from(table.values()).map((r) => ({ ...r, goalDiff: r.goalsFor - r.goalsAgainst }));

  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamName.localeCompare(b.teamName, "fa");
  });

  return rows;
}

export function computeTopScorers(players) {
  return players
    .filter((p) => p.stats && p.stats.goals > 0)
    .sort((a, b) => b.stats.goals - a.stats.goals);
}
