export function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function teamLogoHtml(logoUrl, name, size = 40) {
  if (logoUrl) {
    return `<img class="team-logo" src="${escapeHtml(logoUrl)}" alt="${escapeHtml(name)}" style="width:${size}px;height:${size}px" />`;
  }
  const fontSize = Math.round(size * 0.4);
  return `<div class="team-logo logo-fallback" style="width:${size}px;height:${size}px;font-size:${fontSize}px">${escapeHtml((name || "؟")[0])}</div>`;
}

export function playerPhotoHtml(photoUrl, name, size = 56) {
  if (photoUrl) {
    return `<img class="player-photo" src="${escapeHtml(photoUrl)}" alt="${escapeHtml(name)}" style="width:${size}px;height:${size}px" />`;
  }
  const fontSize = Math.round(size * 0.35);
  return `<div class="player-photo logo-fallback" style="width:${size}px;height:${size}px;font-size:${fontSize}px">${escapeHtml((name || "؟")[0])}</div>`;
}

export function badgeHtml(text, tone = "gold") {
  return `<span class="badge badge-${tone}">${escapeHtml(text)}</span>`;
}

export function spinnerHtml() {
  return `<div class="spinner"></div>`;
}

export function emptyStateHtml(title, hint = "") {
  return `
    <div class="glass-card empty-state">
      <p>${escapeHtml(title)}</p>
      ${hint ? `<p>${escapeHtml(hint)}</p>` : ""}
    </div>
  `;
}

export function statusBadge(status) {
  if (status === "finished") return badgeHtml("پایان یافته", "green");
  if (status === "postponed") return badgeHtml("به تعویق افتاد", "red");
  return badgeHtml("آینده", "blue");
}
