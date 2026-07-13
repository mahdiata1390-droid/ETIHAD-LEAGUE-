import { guardAdmin } from "./access-guard.js";
import { listenTeams, createTeam, updateTeam, deleteTeam, uploadImage } from "./firestore-service.js";
import { teamLogoHtml, spinnerHtml, escapeHtml } from "./ui-helpers.js";

export function renderAdminTeams(container) {
  return guardAdmin(container, (el) => renderContent(el));
}

function renderContent(container) {
  let teams = null;
  let editing = null; // شیء تیم در حال ویرایش یا null برای افزودن

  function paint() {
    container.innerHTML = `
      <div class="container" style="padding:32px 0;">
        <h1 class="section-title" style="margin-bottom:24px;">مدیریت تیم‌ها</h1>

        <div class="glass-card" style="margin-bottom:32px;">
          <h2 style="color:var(--gold-light);margin:0 0 16px;">${editing ? "ویرایش تیم" : "افزودن تیم جدید"}</h2>
          <form id="team-form" class="form-grid">
            <input class="input-field" id="t-name" placeholder="نام تیم" value="${escapeHtml(editing?.name || "")}" required />
            <input class="input-field" id="t-city" placeholder="شهر (اختیاری)" value="${escapeHtml(editing?.city || "")}" />
            <input class="input-field" id="t-year" type="number" placeholder="سال تأسیس (اختیاری)" value="${editing?.foundedYear || ""}" />
            <input class="input-field" id="t-logo" type="file" accept="image/*" />
            <div class="form-actions">
              <button type="submit" class="btn-gold" id="t-submit">${editing ? "ذخیره تغییرات" : "افزودن تیم"}</button>
              ${editing ? `<button type="button" class="btn-outline" id="t-cancel">انصراف</button>` : ""}
            </div>
          </form>
        </div>

        ${teams === null ? spinnerHtml() : `
          <div class="grid grid-3">
            ${teams.map((t) => `
              <div class="glass-card" style="display:flex;align-items:center;gap:14px;">
                ${teamLogoHtml(t.logoUrl, t.name, 52)}
                <div style="flex:1;min-width:0;">
                  <p style="font-weight:700;">${escapeHtml(t.name)}</p>
                  ${t.city ? `<p style="font-size:12px;color:var(--text-muted);">${escapeHtml(t.city)}</p>` : ""}
                </div>
                <div style="display:flex;gap:8px;">
                  <button class="btn-outline" style="padding:6px 12px;font-size:12px;" data-edit="${escapeHtml(t.id)}">ویرایش</button>
                  <button class="btn-danger" data-delete="${escapeHtml(t.id)}">حذف</button>
                </div>
              </div>
            `).join("")}
          </div>
        `}
      </div>
    `;

    const form = container.querySelector("#team-form");
    form.addEventListener("submit", onSubmit);
    const cancelBtn = container.querySelector("#t-cancel");
    if (cancelBtn) cancelBtn.addEventListener("click", () => { editing = null; paint(); });

    container.querySelectorAll("[data-edit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        editing = teams.find((t) => t.id === btn.dataset.edit) || null;
        paint();
        container.querySelector("#team-form").scrollIntoView({ behavior: "smooth" });
      });
    });
    container.querySelectorAll("[data-delete]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const team = teams.find((t) => t.id === btn.dataset.delete);
        if (!team || !confirm(`آیا از حذف تیم «${team.name}» مطمئن هستید؟`)) return;
        await deleteTeam(team.id);
      });
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    const name = container.querySelector("#t-name").value.trim();
    const city = container.querySelector("#t-city").value.trim();
    const year = container.querySelector("#t-year").value;
    const file = container.querySelector("#t-logo").files[0];
    if (!name) return;

    const submitBtn = container.querySelector("#t-submit");
    submitBtn.disabled = true;
    submitBtn.textContent = "در حال ذخیره...";
    try {
      let logoUrl = editing?.logoUrl;
      if (file) logoUrl = await uploadImage(file, `teams/${Date.now()}-${file.name}`);
      const payload = { name, city, foundedYear: year ? Number(year) : undefined, logoUrl };
      if (editing) await updateTeam(editing.id, payload);
      else await createTeam(payload);
      editing = null;
      paint();
    } catch (err) {
      alert("خطا در ذخیره‌سازی: " + err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = editing ? "ذخیره تغییرات" : "افزودن تیم";
    }
  }

  paint();
  const unsub = listenTeams((d) => { teams = d; paint(); });
  return unsub;
}
