const STATIC_CACHE = "ctrotech-static-v1";
const DYNAMIC_CACHE = "ctrotech-dynamic-v1";
const OFFLINE_URL = "/offline.html";

// Static assets to pre-cache
const STATIC_ASSETS = [
  "/",
  "index.html",
  "questions.html",
  "app.js",
  "questionData.js",
  "favicon.png",
  "apple-touch-icon.png",
  "site.webmanifest",
  "favicon-16x16.png",
  "favicon-32x32.png",
  OFFLINE_URL
];

// Limit dynamic cache size
const limitCacheSize = async (cacheName, maxItems) => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    return limitCacheSize(cacheName, maxItems);
  }
};

// Install static assets
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: Clean old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch handling
self.addEventListener("fetch", event => {
  const { request } = event;

  if (request.method !== "GET") return;

  // Handle HTML pages with fallback
  if (request.headers.get("accept").includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then(response => {
          return caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request.url, response.clone());
            limitCacheSize(DYNAMIC_CACHE, 50);
            return response;
          });
        })
        .catch(() => caches.match(request).then(res => res || caches.match(OFFLINE_URL)))
    );
    return;
  }

  // Cache-first for static files
  event.respondWith(
    caches.match(request).then(cacheRes => {
      return (
        cacheRes ||
        fetch(request).then(fetchRes => {
          return caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request.url, fetchRes.clone());
            limitCacheSize(DYNAMIC_CACHE, 50);
            return fetchRes;
          });
        })
      );
    })
  );
});