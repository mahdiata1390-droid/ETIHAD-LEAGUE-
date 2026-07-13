import { listenPlayers, submitMatchResult } from "./firestore-service.js";
import { escapeHtml } from "./ui-helpers.js";

/**
 * فرم ثبت نتیجه‌ی مسابقه را داخل containerEl رندر می‌کند.
 * onDone بعد از ثبت موفق فراخوانی می‌شود.
 * یک تابع cleanup برمی‌گرداند.
 */
export function renderMatchResultForm(containerEl, match, onDone) {
  let players = [];
  let goals = match.goals ? JSON.parse(JSON.stringify(match.goals)) : [];
  let cards = match.cards ? JSON.parse(JSON.stringify(match.cards)) : [];
  let lineup = match.lineup ? [...match.lineup] : [];
  let lineupInitialized = !!(match.lineup && match.lineup.length);
  let homeScore = match.homeScore ?? 0;
  let awayScore = match.awayScore ?? 0;
  let motmId = match.manOfTheMatchId || "";

  function playerName(id) {
    return (players.find((p) => p.id === id) || {}).name || "";
  }
  function playerTeam(id) {
    return (players.find((p) => p.id === id) || {}).teamId || "";
  }

  function playerOptions(selected) {
    return players.map((p) => `<option value="${escapeHtml(p.id)}" ${p.id === selected ? "selected" : ""}>${escapeHtml(p.name)}</option>`).join("");
  }

  function paint() {
    containerEl.innerHTML = `
      <div class="glass-card">
        <h3 style="color:var(--gold-light);margin:0 0 16px;">
          ثبت نتیجه: ${escapeHtml(match.homeTeamName)} در برابر ${escapeHtml(match.awayTeamName)}
        </h3>

        <div style="display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:24px;">
          <input type="number" min="0" id="mr-home-score" class="input-field" style="width:80px;text-align:center;" value="${homeScore}" />
          <span style="color:var(--text-muted);">—</span>
          <input type="number" min="0" id="mr-away-score" class="input-field" style="width:80px;text-align:center;" value="${awayScore}" />
        </div>

        <div style="margin-bottom:24px;">
          <p style="font-weight:600;font-size:14px;margin-bottom:8px;">👥 بازیکنان حاضر در مسابقه (برای شمارش «تعداد بازی»)</p>
          <div class="lineup-grid">
            ${players.map((p) => `
              <label class="lineup-item">
                <input type="checkbox" data-lineup="${escapeHtml(p.id)}" ${lineup.includes(p.id) ? "checked" : ""} />
                ${escapeHtml(p.name)}
              </label>
            `).join("")}
          </div>
        </div>

        <div style="margin-bottom:24px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <p style="font-weight:600;font-size:14px;">⚽ گلزنان و پاس‌گل‌ها</p>
            <button type="button" class="btn-outline" style="font-size:12px;padding:6px 12px;" id="mr-add-goal">افزودن گل</button>
          </div>
          <div id="mr-goals">
            ${goals.map((g, i) => `
              <div class="event-row" data-goal-index="${i}">
                <select class="input-field" style="font-size:13px;" data-goal-player="${i}">${playerOptions(g.playerId)}</select>
                <select class="input-field" style="font-size:13px;" data-goal-assist="${i}">
                  <option value="">بدون پاس گل</option>
                  ${playerOptions(g.assistPlayerId)}
                </select>
                <input type="number" class="input-field" style="font-size:13px;" placeholder="دقیقه" value="${g.minute || ""}" data-goal-minute="${i}" />
                <button type="button" class="remove-btn" data-goal-remove="${i}">✕</button>
              </div>
            `).join("")}
          </div>
        </div>

        <div style="margin-bottom:24px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <p style="font-weight:600;font-size:14px;">🟨🟥 کارت‌ها</p>
            <button type="button" class="btn-outline" style="font-size:12px;padding:6px 12px;" id="mr-add-card">افزودن کارت</button>
          </div>
          <div id="mr-cards">
            ${cards.map((c, i) => `
              <div class="card-event-row" data-card-index="${i}">
                <select class="input-field" style="font-size:13px;" data-card-player="${i}">${playerOptions(c.playerId)}</select>
                <select class="input-field" style="font-size:13px;" data-card-type="${i}">
                  <option value="yellow" ${c.type === "yellow" ? "selected" : ""}>زرد</option>
                  <option value="red" ${c.type === "red" ? "selected" : ""}>قرمز</option>
                </select>
                <input type="number" class="input-field" style="font-size:13px;" placeholder="دقیقه" value="${c.minute || ""}" data-card-minute="${i}" />
                <button type="button" class="remove-btn" data-card-remove="${i}">✕</button>
              </div>
            `).join("")}
          </div>
        </div>

        <div style="margin-bottom:24px;">
          <p style="font-weight:600;font-size:14px;margin-bottom:8px;">🏅 بهترین بازیکن مسابقه</p>
          <select class="input-field" id="mr-motm">
            <option value="">انتخاب نشده</option>
            ${playerOptions(motmId)}
          </select>
        </div>

        <button type="button" class="btn-gold" id="mr-save" style="width:100%;">ثبت نتیجه</button>
      </div>
    `;
    bindEvents();
  }

  function bindEvents() {
    containerEl.querySelector("#mr-home-score").addEventListener("input", (e) => { homeScore = Number(e.target.value); });
    containerEl.querySelector("#mr-away-score").addEventListener("input", (e) => { awayScore = Number(e.target.value); });
    containerEl.querySelector("#mr-motm").addEventListener("change", (e) => { motmId = e.target.value; });

    containerEl.querySelectorAll("[data-lineup]").forEach((cb) => {
      cb.addEventListener("change", () => {
        const pid = cb.dataset.lineup;
        if (cb.checked) { if (!lineup.includes(pid)) lineup.push(pid); }
        else { lineup = lineup.filter((id) => id !== pid); }
      });
    });

    containerEl.querySelector("#mr-add-goal").addEventListener("click", () => {
      if (players.length === 0) return;
      goals.push({ playerId: players[0].id, playerName: players[0].name, teamId: players[0].teamId });
      paint();
    });
    containerEl.querySelectorAll("[data-goal-player]").forEach((sel) => {
      sel.addEventListener("change", (e) => {
        const i = Number(sel.dataset.goalPlayer);
        goals[i].playerId = e.target.value;
        goals[i].playerName = playerName(e.target.value);
        goals[i].teamId = playerTeam(e.target.value);
      });
    });
    containerEl.querySelectorAll("[data-goal-assist]").forEach((sel) => {
      sel.addEventListener("change", (e) => {
        const i = Number(sel.dataset.goalAssist);
        goals[i].assistPlayerId = e.target.value || undefined;
        goals[i].assistPlayerName = e.target.value ? playerName(e.target.value) : undefined;
      });
    });
    containerEl.querySelectorAll("[data-goal-minute]").forEach((inp) => {
      inp.addEventListener("input", (e) => {
        const i = Number(inp.dataset.goalMinute);
        goals[i].minute = Number(e.target.value) || undefined;
      });
    });
    containerEl.querySelectorAll("[data-goal-remove]").forEach((btn) => {
      btn.addEventListener("click", () => {
        goals.splice(Number(btn.dataset.goalRemove), 1);
        paint();
      });
    });

    containerEl.querySelector("#mr-add-card").addEventListener("click", () => {
      if (players.length === 0) return;
      cards.push({ playerId: players[0].id, playerName: players[0].name, teamId: players[0].teamId, type: "yellow" });
      paint();
    });
    containerEl.querySelectorAll("[data-card-player]").forEach((sel) => {
      sel.addEventListener("change", (e) => {
        const i = Number(sel.dataset.cardPlayer);
        cards[i].playerId = e.target.value;
        cards[i].playerName = playerName(e.target.value);
        cards[i].teamId = playerTeam(e.target.value);
      });
    });
    containerEl.querySelectorAll("[data-card-type]").forEach((sel) => {
      sel.addEventListener("change", (e) => {
        cards[Number(sel.dataset.cardType)].type = e.target.value;
      });
    });
    containerEl.querySelectorAll("[data-card-minute]").forEach((inp) => {
      inp.addEventListener("input", (e) => {
        cards[Number(inp.dataset.cardMinute)].minute = Number(e.target.value) || undefined;
      });
    });
    containerEl.querySelectorAll("[data-card-remove]").forEach((btn) => {
      btn.addEventListener("click", () => {
        cards.splice(Number(btn.dataset.cardRemove), 1);
        paint();
      });
    });

    containerEl.querySelector("#mr-save").addEventListener("click", onSave);
  }

  async function onSave() {
    const saveBtn = containerEl.querySelector("#mr-save");
    saveBtn.disabled = true;
    saveBtn.textContent = "در حال ثبت...";
    try {
      await submitMatchResult(match.id, {
        homeScore, awayScore, goals, cards, lineup,
        manOfTheMatchId: motmId || undefined,
        manOfTheMatchName: motmId ? playerName(motmId) : undefined
      });
      if (typeof onDone === "function") onDone();
    } catch (err) {
      alert("خطا در ثبت نتیجه: " + err.message);
      saveBtn.disabled = false;
      saveBtn.textContent = "ثبت نتیجه";
    }
  }

  paint();
  const unsub = listenPlayers((all) => {
    players = all.filter((p) => p.teamId === match.homeTeamId || p.teamId === match.awayTeamId);
    if (!lineupInitialized) {
      lineup = players.map((p) => p.id);
      lineupInitialized = true;
    }
    paint();
  });

  return unsub;
}
