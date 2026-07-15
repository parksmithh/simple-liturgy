const CACHE = "daily-office-reader-v0.3.49";
const CONTENT_ROOT = self.registration.scope.endsWith("/web/") ? "../" : "./";
const PACK_URL = `${CONTENT_ROOT}firmware/circuitpython/readings.active.jsonl?v=0.3.49`;
const COLLECTS_URL = `${CONTENT_ROOT}data/collects/collects.json`;
const PACK_PATH = new URL(PACK_URL, self.registration.scope).pathname;
const COLLECTS_PATH = new URL(COLLECTS_URL, self.registration.scope).pathname;
const SHELL = [
  "./",
  "./index.html",
  "./design-tokens.css?v=0.3.49",
  "./app.css?v=0.3.49",
  "./app.js?v=0.3.49",
  "./bookmark-engine.js?v=0.3.49",
  "./feast-link-preference.js?v=0.3.49",
  "./feast-wikipedia.js?v=0.3.49",
  "./pixel-art.js?v=0.3.49",
  "./theme.js?v=0.3.49",
  "./version.js?v=0.3.49",
  "./manifest.webmanifest?v=0.3.49",
  "./icon.svg?v=0.3.49",
  "./assets/og-simple-liturgy.png?v=3",
  "./llms.txt",
  PACK_URL,
  COLLECTS_URL,
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

async function fetchAndCache(request) {
  const response = await fetch(request);
  if (response.ok && new URL(request.url).origin === self.location.origin) {
    const cache = await caches.open(CACHE);
    await cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);

  if (url.pathname === PACK_PATH || url.pathname === COLLECTS_PATH) {
    event.respondWith(caches.match(event.request).then(cached => {
      const refresh = fetchAndCache(event.request).catch(() => null);
      if (cached) {
        event.waitUntil(refresh);
        return cached;
      }
      return refresh.then(response => response || Response.error());
    }));
    return;
  }

  event.respondWith(
    fetchAndCache(event.request).catch(async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      if (event.request.mode === "navigate") return caches.match("./");
      return Response.error();
    }),
  );
});
