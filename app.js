import "./auth-state.js"; // شروع گوش‌دادن به تغییرات ورود
import { registerRoute, initRouter } from "./router.js";
import { renderHeader, renderFooter } from "./nav-footer.js";

import { renderHome } from "./page-home.js";
import { renderStandings } from "./page-standings.js";
import { renderTeams } from "./page-teams.js";
import { renderTeamDetail } from "./page-team-detail.js";
import { renderPlayers } from "./page-players.js";
import { renderPlayerDetail } from "./page-player-detail.js";
import { renderMatches } from "./page-matches.js";
import { renderMatchDetail } from "./page-match-detail.js";
import { renderScorers } from "./page-scorers.js";
import { renderNews } from "./page-news.js";
import { renderLogin } from "./page-login.js";
import { renderAdminDashboard } from "./page-admin-dashboard.js";
import { renderAdminTeams } from "./page-admin-teams.js";
import { renderAdminPlayers } from "./page-admin-players.js";
import { renderAdminMatches } from "./page-admin-matches.js";
import { renderAdminNews } from "./page-admin-news.js";
import { renderPlayerPanel } from "./page-player-panel.js";

// ساخت اسکلت اصلی صفحه: هدر ثابت + محتوای مسیر فعلی + فوتر
const appRoot = document.getElementById("app");
appRoot.innerHTML = `
  <div id="app-header"></div>
  <main><div id="app-content"></div></main>
  <div id="app-footer"></div>
`;

renderHeader(document.getElementById("app-header"));
renderFooter(document.getElementById("app-footer"));

registerRoute("/", (el) => renderHome(el));
registerRoute("/standings", (el) => renderStandings(el));
registerRoute("/teams", (el) => renderTeams(el));
registerRoute("/teams/:id", (el, params) => renderTeamDetail(el, params));
registerRoute("/players", (el) => renderPlayers(el));
registerRoute("/players/:id", (el, params) => renderPlayerDetail(el, params));
registerRoute("/matches", (el) => renderMatches(el));
registerRoute("/matches/:id", (el, params) => renderMatchDetail(el, params));
registerRoute("/scorers", (el) => renderScorers(el));
registerRoute("/news", (el) => renderNews(el));
registerRoute("/login", (el) => renderLogin(el));
registerRoute("/admin", (el) => renderAdminDashboard(el));
registerRoute("/admin/teams", (el) => renderAdminTeams(el));
registerRoute("/admin/players", (el) => renderAdminPlayers(el));
registerRoute("/admin/matches", (el) => renderAdminMatches(el));
registerRoute("/admin/news", (el) => renderAdminNews(el));
registerRoute("/player-panel", (el) => renderPlayerPanel(el));

initRouter();
