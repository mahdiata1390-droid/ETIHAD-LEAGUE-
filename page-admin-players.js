import { guardAdmin } from "./access-guard.js";
import {
  listenTeams, listenPlayers, createPlayer, updatePlayer, deletePlayer,
  uploadImage, linkPlayerAccount, unlinkPlayerAccount
} from "./firestore-service.js";
import { playerPhotoHtml, spinnerHtml, escapeHtml } from "./ui-helpers.js";

const POSITIONS = ["دروازه‌بان", "مدافع", "هافبک", "مهاجم"];

export function renderAdminPlayers(container) {
  return guardAdmin(container, (el) => renderContent(el));
}

function renderContent(container) {
  let players = null;
  let teams = null;
  let editing = null;

  function paint() {
    container.innerHTML = `
      <div class="container" style="padding:32px 0;">
        <h1 class="section-title" style="margin-bottom:24px;">مدیریت بازیکنان</h1>

        <div class="glass-card" style="margin-bottom:32px;">
          <h2 style="color:var(--gold-light);margin:0 0 16px;">${editing ? "ویرایش بازیکن" : "افزودن بازیکن جدید"}</h2>
          <form id="player-form" class="form-grid">
            <input class="input-field" id="p-name" placeholder="نام بازیکن" value="${escapeHtml(editing?.name || "")}" required />
            <select class="input-field" id="p-team" required>
              <option value="">انتخاب تیم</option>
              ${(teams || []).map((t) => `<option value="${escapeHtml(t.id)}" ${editing?.teamId === t.id ? "selected" : ""}>${escapeHtml(t.name)}</option>`).join("")}
            </select>
            <input class="input-field" id="p-number" type="number" placeholder="شماره پیراهن" value="${editing?.shirtNumber || ""}" required />
            <select class="input-field" id="p-position">
              ${POSITIONS.map((p) => `<option value="${p}" ${editing?.position === p ? "selected" : ""}>${p}</option>`).join("")}
            </select>
            <input class="input-field full" id="p-photo" type="file" accept="image/*" />
            <div class="form-actions">
              <button type="submit" class="btn-gold" id="p-submit">${editing ? "ذخیره تغییرات" : "افزودن بازیکن"}</button>
              ${editing ? `<button type="button" class="btn-outline" id="p-cancel">انصراف</button>` : ""}
            </div>
          </form>
        </div>

        ${players === null ? spinnerHtml() : `
          <div class="grid grid-3">
            ${players.map((p) => `
              <div class="glass-card">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                  ${playerPhotoHtml(p.photoUrl, p.name, 48)}
                  <div style="flex:1;min-width:0;">
                    <p style="font-weight:700;font-size:14px;">${escapeHtml(p.name)}</p>
                    <p style="font-size:12px;color:var(--text-muted);">${escapeHtml(p.teamName || "")} · ${escapeHtml(p.position || "")} · #${escapeHtml(p.shirtNumber)}</p>
                  </div>
                  <div style="display:flex;flex-direction:column;gap:6px;">
                    <button class="btn-outline" style="padding:4px 10px;font-size:12px;" data-edit="${escapeHtml(p.id)}">ویرایش</button>
                    <button class="btn-danger" data-delete="${escapeHtml(p.id)}">حذف</button>
                  </div>
                </div>
                <div style="padding-top:12px;border-top:1px solid rgba(255,255,255,0.1);">
                  ${p.authUid ? `
                    <div class="link-status">
                      <span style="font-size:12px;color:var(--green);">✓ حساب متصل است</span>
                      <button style="font-size:12px;color:#fca5a5;background:none;border:none;cursor:pointer;" data-unlink="${escapeHtml(p.id)}" data-uid="${escapeHtml(p.authUid)}">قطع اتصال</button>
                    </div>
                  ` : `
                    <div class="link-row">
                      <input class="input-field" style="font-size:12px;padding:6px 10px;" dir="ltr" placeholder="UID حساب Firebase بازیکن" data-uid-input="${escapeHtml(p.id)}" />
                      <button class="btn-outline" style="padding:6px 12px;font-size:12px;flex-shrink:0;" data-link="${escapeHtml(p.id)}">اتصال</button>
                    </div>
                  `}
                </div>
              </div>
            `).join("")}
          </div>
        `}
      </div>
    `;

    container.querySelector("#player-form").addEventListener("submit", onSubmit);
    const cancelBtn = container.querySelector("#p-cancel");
    if (cancelBtn) cancelBtn.addEventListener("click", () => { editing = null; paint(); });

    container.querySelectorAll("[data-edit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        editing = players.find((p) => p.id === btn.dataset.edit) || null;
        paint();
        container.querySelector("#player-form").scrollIntoView({ behavior: "smooth" });
      });
    });
    container.querySelectorAll("[data-delete]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const player = players.find((p) => p.id === btn.dataset.delete);
        if (!player || !confirm(`آیا از حذف بازیکن «${player.name}» مطمئن هستید؟`)) return;
        await deletePlayer(player.id);
      });
    });
    container.querySelectorAll("[data-link]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const input = container.querySelector(`[data-uid-input="${btn.dataset.link}"]`);
        const uid = input?.value.trim();
        if (!uid) return;
        await linkPlayerAccount(uid, btn.dataset.link);
      });
    });
    container.querySelectorAll("[data-unlink]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("اتصال حساب این بازیکن قطع شود؟")) return;
        await unlinkPlayerAccount(btn.dataset.uid, btn.dataset.unlink);
      });
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    const name = container.querySelector("#p-name").value.trim();
    const teamId = container.querySelector("#p-team").value;
    const shirtNumber = container.querySelector("#p-number").value;
    const position = container.querySelector("#p-position").value;
    const file = container.querySelector("#p-photo").files[0];
    if (!name || !teamId || !shirtNumber) return;

    const submitBtn = container.querySelector("#p-submit");
    submitBtn.disabled = true;
    submitBtn.textContent = "در حال ذخیره...";
    try {
      let photoUrl = editing?.photoUrl;
      if (file) photoUrl = await uploadImage(file, `players/${Date.now()}-${file.name}`);
      const team = (teams || []).find((t) => t.id === teamId);
      const payload = { name, teamId, teamName: team?.name || "", shirtNumber: Number(shirtNumber), position, photoUrl };
      if (editing) await updatePlayer(editing.id, payload);
      else await createPlayer(payload);
      editing = null;
      paint();
    } catch (err) {
      alert("خطا در ذخیره‌سازی: " + err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = editing ? "ذخیره تغییرات" : "افزودن بازیکن";
    }
  }

  paint();
  const u1 = listenPlayers((d) => { players = d; paint(); });
  const u2 = listenTeams((d) => { teams = d; paint(); });
  return () => { u1(); u2(); };
}
