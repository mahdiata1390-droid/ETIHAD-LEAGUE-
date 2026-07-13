import { guardAdmin } from "./access-guard.js";
import { listenNews, createNews, deleteNews, uploadImage } from "./firestore-service.js";
import { newsCardHtml } from "./component-news-card.js";
import { spinnerHtml, escapeHtml } from "./ui-helpers.js";

export function renderAdminNews(container) {
  return guardAdmin(container, (el) => renderContent(el));
}

function renderContent(container) {
  let news = null;
  let type = "news";

  function paint() {
    container.innerHTML = `
      <div class="container" style="padding:32px 0;">
        <h1 class="section-title" style="margin-bottom:24px;">مدیریت اخبار</h1>

        <div class="glass-card" style="margin-bottom:32px;">
          <h2 style="color:var(--gold-light);margin:0 0 16px;">انتشار خبر یا اطلاعیه جدید</h2>
          <form id="news-form" style="display:flex;flex-direction:column;gap:16px;">
            <div style="display:flex;gap:12px;">
              <button type="button" class="filter-btn ${type === "news" ? "active" : ""}" style="flex:1;" data-type="news">خبر</button>
              <button type="button" class="filter-btn ${type === "announcement" ? "active" : ""}" style="flex:1;" data-type="announcement">اطلاعیه</button>
            </div>
            <input class="input-field" id="n-title" placeholder="عنوان" required />
            <textarea class="input-field" id="n-body" style="min-height:120px;" placeholder="متن خبر یا اطلاعیه..." required></textarea>
            <input class="input-field" id="n-image" type="file" accept="image/*" />
            <button type="submit" class="btn-gold" id="n-submit">انتشار</button>
          </form>
        </div>

        ${news === null ? spinnerHtml() : `
          <div class="grid grid-3">
            ${news.map((n) => newsCardHtml(n, `<button class="btn-danger" style="position:absolute;top:12px;left:12px;background:var(--obsidian);" data-delete-news="${escapeHtml(n.id)}">حذف</button>`)).join("")}
          </div>
        `}
      </div>
    `;

    container.querySelectorAll("[data-type]").forEach((btn) => {
      btn.addEventListener("click", () => { type = btn.dataset.type; paint(); });
    });
    container.querySelector("#news-form").addEventListener("submit", onSubmit);
    container.querySelectorAll("[data-delete-news]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("آیا از حذف این خبر مطمئن هستید؟")) return;
        await deleteNews(btn.dataset.deleteNews);
      });
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    const title = container.querySelector("#n-title").value.trim();
    const body = container.querySelector("#n-body").value.trim();
    const file = container.querySelector("#n-image").files[0];
    if (!title || !body) return;

    const submitBtn = container.querySelector("#n-submit");
    submitBtn.disabled = true;
    submitBtn.textContent = "در حال انتشار...";
    try {
      let imageUrl;
      if (file) imageUrl = await uploadImage(file, `news/${Date.now()}-${file.name}`);
      await createNews({ title, body, type, imageUrl });
      type = "news";
      paint();
    } catch (err) {
      alert("خطا: " + err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = "انتشار";
    }
  }

  paint();
  const unsub = listenNews((d) => { news = d; paint(); });
  return unsub;
}
