import { guardAdmin } from "./access-guard.js";
import { listenTeams, listenMatches, createMatch, deleteMatch, updateMatchSchedule } from "./firestore-service.js";
import { renderMatchResultForm } from "./component-match-result-form.js";
import { teamLogoHtml, statusBadge, spinnerHtml, escapeHtml } from "./ui-helpers.js";
import { toJalali } from "./date-utils.js";

export function renderAdminMatches(container) {
  return guardAdmin(container, (el) => renderContent(el));
}

function renderContent(container) {
  let teams = null;
  let matches = null;
  let resultMatchId = null;
  let resultFormCleanup = null;

  function paint() {
    const resultMatch = matches?.find((m) => m.id === resultMatchId) || null;

    container.innerHTML = `
      <div class="container" style="padding:32px 0;">
        <h1 class="section-title" style="margin-bottom:24px;">مدیریت مسابقات</h1>

        <div class="glass-card" style="margin-bottom:32px;">
          <h2 style="color:var(--gold-light);margin:0 0 16px;">ایجاد مسابقه جدید</h2>
          <form id="match-form" class="form-grid">
            <select class="input-field" id="m-home" required>
              <option value="">تیم میزبان</option>
              ${(teams || []).map((t) => `<option value="${escapeHtml(t.id)}">${escapeHtml(t.name)}</option>`).join("")}
            </select>
            <select class="input-field" id="m-away" required>
              <option value="">تیم مهمان</option>
              ${(teams || []).map((t) => `<option value="${escapeHtml(t.id)}">${escapeHtml(t.name)}</option>`).join("")}
            </select>
            <input class="input-field" id="m-date" type="date" required />
            <input class="input-field" id="m-time" type="time" required />
            <input class="input-field full" id="m-venue" placeholder="محل برگزاری (مثلاً ورزشگاه آزادی)" />
            <div class="form-actions">
              <button type="submit" class="btn-gold" id="m-submit">ایجاد مسابقه</button>
            </div>
          </form>
        </div>

        <div id="result-form-slot" style="margin-bottom:32px;"></div>

        ${matches === null ? spinnerHtml() : `
          <div style="display:flex;flex-direction:column;gap:12px;">
            ${matches.map((m) => `
              <div class="glass-card" style="display:flex;flex-wrap:wrap;align-items:center;gap:16px;">
                <div style="display:flex;align-items:center;gap:10px;flex:1;">
                  ${teamLogoHtml(m.homeTeamLogo, m.homeTeamName, 32)}
                  <span style="font-size:14px;font-weight:600;">${escapeHtml(m.homeTeamName)}</span>
                  <span style="font-size:12px;color:var(--text-faint);">${m.status === "finished" ? `${m.homeScore} - ${m.awayScore}` : "vs"}</span>
                  <span style="font-size:14px;font-weight:600;">${escapeHtml(m.awayTeamName)}</span>
                  ${teamLogoHtml(m.awayTeamLogo, m.awayTeamName, 32)}
                </div>
                <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text-muted);">
                  <span>${toJalali(m.date)} ${escapeHtml(m.time || "")}</span>
                  ${statusBadge(m.status)}
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                  <button class="btn-outline" style="font-size:12px;padding:6px 12px;" data-result="${escapeHtml(m.id)}">ثبت/ویرایش نتیجه</button>
                  <button class="btn-outline" style="font-size:12px;padding:6px 12px;" data-postpone="${escapeHtml(m.id)}">${m.status === "postponed" ? "لغو تعویق" : "تعویق مسابقه"}</button>
                  <button class="btn-danger" data-delete="${escapeHtml(m.id)}">حذف</button>
                </div>
              </div>
            `).join("")}
          </div>
        `}
      </div>
    `;

    container.querySelector("#match-form").addEventListener("submit", onCreate);
    container.querySelectorAll("[data-result]").forEach((btn) => {
      btn.addEventListener("click", () => { resultMatchId = btn.dataset.result; paint(); });
    });
    container.querySelectorAll("[data-postpone]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const m = matches.find((x) => x.id === btn.dataset.postpone);
        if (!m) return;
        await updateMatchSchedule(m.id, { status: m.status === "postponed" ? "scheduled" : "postponed" });
      });
    });
    container.querySelectorAll("[data-delete]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("آیا از حذف این مسابقه مطمئن هستید؟")) return;
        await deleteMatch(btn.dataset.delete);
      });
    });

    if (typeof resultFormCleanup === "function") { resultFormCleanup(); resultFormCleanup = null; }
    if (resultMatch) {
      const slot = container.querySelector("#result-form-slot");
      slot.innerHTML = `<div id="result-form-inner"></div><button class="btn-outline" id="close-result-form" style="width:100%;margin-top:12px;">بستن فرم</button>`;
      resultFormCleanup = renderMatchResultForm(slot.querySelector("#result-form-inner"), resultMatch, () => {
        resultMatchId = null;
        paint();
      });
      slot.querySelector("#close-result-form").addEventListener("click", () => { resultMatchId = null; paint(); });
    }
  }

  async function onCreate(e) {
    e.preventDefault();
    const homeTeamId = container.querySelector("#m-home").value;
    const awayTeamId = container.querySelector("#m-away").value;
    const date = container.querySelector("#m-date").value;
    const time = container.querySelector("#m-time").value;
    const venue = container.querySelector("#m-venue").value.trim();
    if (!homeTeamId || !awayTeamId || homeTeamId === awayTeamId || !date || !time) {
      alert("لطفاً دو تیم متفاوت و تاریخ/ساعت را مشخص کنید.");
      return;
    }
    const submitBtn = container.querySelector("#m-submit");
    submitBtn.disabled = true;
    submitBtn.textContent = "در حال ثبت...";
    try {
      const home = teams.find((t) => t.id === homeTeamId);
      const away = teams.find((t) => t.id === awayTeamId);
      await createMatch({
        homeTeamId, awayTeamId,
        homeTeamName: home?.name || "", awayTeamName: away?.name || "",
        homeTeamLogo: home?.logoUrl, awayTeamLogo: away?.logoUrl,
        date, time, venue
      });
      paint();
    } catch (err) {
      alert("خطا: " + err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = "ایجاد مسابقه";
    }
  }

  paint();
  const u1 = listenTeams((d) => { teams = d; paint(); });
  const u2 = listenMatches((d) => { matches = d; paint(); });
  return () => {
    u1(); u2();
    if (typeof resultFormCleanup === "function") resultFormCleanup();
  };
}
