// Simple Service Worker for PWA
const CACHE_NAME = 'laxly-v5'; // Bumped version — clears old cache, fixes OAuth intercept

const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // ——— NEVER intercept OAuth callbacks or API calls ———
  // Let the browser handle them natively without any SW interference.
  if (
    url.pathname.startsWith('/auth/') ||
    url.pathname.startsWith('/api/')
  ) {
    return; // No event.respondWith → browser fetches directly
  }

  // For SPA page navigations: network-first, fall back to /index.html for offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For static assets (JS/CSS/images): cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
