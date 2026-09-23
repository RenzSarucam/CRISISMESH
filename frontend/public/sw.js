// CrisisMesh service worker.
// Scope: application shell + static assets only. Never caches API responses
// containing incident/SOS/user data — that lives in IndexedDB (see
// lib/offline/db.ts) with its own sync lifecycle, not the HTTP cache, so we
// never serve stale emergency data as if it were fresh.
const CACHE_NAME = "crisismesh-shell-v3";
// Every route a citizen must be able to reach with zero connectivity (spec
// section 38) needs to be precached up front -- Next's router can still fall
// back to a full document navigation when a client-side transition's RSC
// fetch fails offline, and that fallback hits this service worker, not React.
const APP_SHELL = [
  "/",
  "/home",
  "/report",
  "/sos",
  "/map",
  "/profile",
  "/login",
  "/offline",
  "/manifest.json",
  "/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL).catch(() => {})),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Never intercept API calls — those must hit the network (or fail
  // visibly) so SyncManager's own offline handling stays in control.
  if (url.pathname.startsWith("/api/")) return;
  if (event.request.method !== "GET") return;

  // Only a real top-level page load (mode "navigate") should ever fall back
  // to the offline page. Next's router also issues plain `fetch()` calls for
  // RSC data (?_rsc=...) during client-side transitions; substituting the
  // cached /offline Response for one of *those* is actively harmful — fetch
  // Responses carry their source URL, so Next reads "/offline" back as if the
  // server had redirected there and hard-navigates the whole tab to it. For
  // those requests we just let a cache miss/network failure fail normally,
  // which makes Next fall back to a real navigation to the *original* URL —
  // and that real navigation is what the cache-first branch below serves.
  const isNavigation = event.request.mode === "navigate";

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch((err) => {
          if (cached) return cached;
          if (isNavigation) return caches.match("/offline");
          throw err;
        });
      return cached || network;
    }),
  );
});
