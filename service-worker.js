// Service Worker ساده برای نصب PWA و کارکرد آفلاین صفحات اصلی
const CACHE_NAME = "ettehad-league-v1";

const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./router.js",
  "./nav-footer.js",
  "./auth-state.js",
  "./access-guard.js",
  "./firebase-config.js",
  "./firestore-service.js",
  "./standings.js",
  "./date-utils.js",
  "./ui-helpers.js",
  "./component-cards.js",
  "./component-match-card.js",
  "./component-news-card.js",
  "./component-standings-table.js",
  "./component-match-result-form.js",
  "./page-home.js",
  "./page-standings.js",
  "./page-teams.js",
  "./page-team-detail.js",
  "./page-players.js",
  "./page-player-detail.js",
  "./page-matches.js",
  "./page-match-detail.js",
  "./page-scorers.js",
  "./page-news.js",
  "./page-login.js",
  "./page-admin-dashboard.js",
  "./page-admin-teams.js",
  "./page-admin-players.js",
  "./page-admin-matches.js",
  "./page-admin-news.js",
  "./page-player-panel.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./offline.html"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL).catch(() => {}))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // درخواست‌های Firebase همیشه از شبکه (داده‌ها باید تازه باشند)
  if (url.hostname.includes("firestore.googleapis.com") ||
      url.hostname.includes("firebasestorage.googleapis.com") ||
      url.hostname.includes("googleapis.com") ||
      url.hostname.includes("gstatic.com")) {
    return; // بدون دخالت service worker؛ مستقیم به شبکه می‌رود
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("./offline.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
