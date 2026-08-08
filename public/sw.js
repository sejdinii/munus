/* Munus service worker — the QW0 offline shell.
   Philosophy (BACKEND_BAR posture applies to the client too): boring and
   auditable beats clever. Three behaviors only:

   1. Navigations: network-first. Success is cached per-route, so screens
      you've visited (favorites, applications) keep working on a train;
      failure falls back to that cache, then to the precached offline page.
   2. Hashed build assets (/_next/static/): cache-first — content-hashed,
      immutable by construction.
   3. Everything else: untouched. No opaque third-party caching, no
      background sync, no push. Those need their own decisions later.

   The app's data layer needs nothing here: the store lives in
   localStorage, so a cached shell is a WORKING app for saved content —
   which is exactly the offline promise the OfflineState copy makes.

   Bump VERSION on any change to this file's logic; activation prunes
   old caches. */

const VERSION = "munus-sw-v2";
const PAGES = `${VERSION}-pages`;
const ASSETS = `${VERSION}-assets`;
const OFFLINE_URL = "/offline.html";
/* Pages cache is bounded: FIFO-trim beyond this many entries so months of
   /jobs/* and /studio/* visits can't grow storage forever (critic QW0 #8). */
const PAGES_MAX = 30;

async function putPageBounded(request, response) {
  const cache = await caches.open(PAGES);
  await cache.put(request, response);
  const keys = await cache.keys();
  /* keys() is insertion-ordered; never evict the offline fallback. */
  const evictable = keys.filter(
    (k) => !k.url.endsWith(OFFLINE_URL),
  );
  for (let i = 0; i < evictable.length - PAGES_MAX; i++) {
    await cache.delete(evictable[i]);
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((cache) => cache.addAll([OFFLINE_URL]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(VERSION))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            putPageBounded(request, copy);
          }
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((hit) => hit ?? caches.match(OFFLINE_URL))
            .then((hit) => hit ?? Response.error()),
        ),
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ??
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(ASSETS).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
  }
});
