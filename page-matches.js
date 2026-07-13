import { listenMatches } from "./firestore-service.js";
import { matchCardHtml, attachMatchCardEvents } from "./component-match-card.js";
import { emptyStateHtml, spinnerHtml } from "./ui-helpers.js";

const filters = [
  { key: "all", label: "همه" },
  { key: "scheduled", label: "آینده" },
  { key: "finished", label: "پایان‌یافته" },
  { key: "postponed", label: "به‌تعویق‌افتاده" }
];

export function renderMatches(container) {
  let matches = null;
  let filter = "all";

  function paint() {
    const filtered = (matches || []).filter((m) => filter === "all" || m.status === filter);
    container.innerHTML = `
      <div class="container" style="padding:32px 0;">
        <div class="section-head" style="flex-wrap:wrap;gap:12px;">
          <h1 class="section-title">مسابقات</h1>
          <div class="filter-row">
            ${filters.map((f) => `<button class="filter-btn ${filter === f.key ? "active" : ""}" data-filter="${f.key}">${f.label}</button>`).join("")}
          </div>
        </div>
        ${matches === null ? spinnerHtml()
          : filtered.length === 0 ? emptyStateHtml("مسابقه‌ای یافت نشد")
          : `<div class="grid grid-3">${filtered.map((m) => matchCardHtml(m)).join("")}</div>`}
      </div>
    `;
    attachMatchCardEvents(container);
    container.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => { filter = btn.dataset.filter; paint(); });
    });
  }

  paint();
  const unsub = listenMatches((d) => { matches = d; paint(); });
  return unsub;
}
