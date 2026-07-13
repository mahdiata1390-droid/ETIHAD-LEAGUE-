import { badgeHtml, escapeHtml } from "./ui-helpers.js";
import { toJalali } from "./date-utils.js";

export function newsCardHtml(item, extraHtml = "") {
  return `
    <div class="glass-card" style="position:relative;">
      ${extraHtml}
      <div class="news-top">
        ${badgeHtml(item.type === "announcement" ? "اطلاعیه" : "خبر", item.type === "announcement" ? "red" : "gold")}
        <span class="news-date">${toJalali(new Date(item.createdAt).toISOString())}</span>
      </div>
      ${item.imageUrl ? `<img class="news-image" src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.title)}" />` : ""}
      <h3 class="news-title">${escapeHtml(item.title)}</h3>
      <p class="news-body">${escapeHtml(item.body)}</p>
    </div>
  `;
}
