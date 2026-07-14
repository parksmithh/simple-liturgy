const CACHE = "daily-office-reader-v62";
const CONTENT_ROOT = self.registration.scope.endsWith("/web/") ? "../" : "./";
const PACK_URL = `${CONTENT_ROOT}firmware/circuitpython/readings.active.jsonl`;
const COLLECTS_URL = `${CONTENT_ROOT}data/collects/collects.json`;
const PACK_PATH = new URL(PACK_URL, self.registration.scope).pathname;
const COLLECTS_PATH = new URL(COLLECTS_URL, self.registration.scope).pathname;
const SHELL = [
  "./",
  "./index.html",
  "./design-tokens.css?v=62",
  "./app.css?v=62",
  "./app.js?v=62",
  "./bookmark-engine.js?v=62",
  "./pixel-art.js?v=62",
  "./theme.js?v=62",
  "./manifest.webmanifest?v=62",
  "./icon.svg?v=62",
  "./assets/og-simple-liturgy.png?v=2",
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
