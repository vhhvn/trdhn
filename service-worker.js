/**
 * Service Worker - Offline Caching
 * Bản đồ số Hành trình Lễ rước Điện Huệ Nam
 */

const CACHE_NAME = 'hue-nam-map-v2';
const ASSETS_TO_CACHE = [
  'index.html',
  '404.html',
  'css/theme.css',
  'css/style.css',
  'css/animation.css',
  'css/responsive.css',
  'js/config.js',
  'js/utils.js',
  'js/dataLoader.js',
  'js/map.js',
  'js/markerManager.js',
  'js/animation.js',
  'js/routeController.js',
  'js/panelManager.js',
  'js/progressManager.js',
  'js/ui.js',
  'js/eventManager.js',
  'js/app.js',
  'data/config.json',
  'data/locations.json',
  'data/routes-march.geojson',
  'data/routes-july.geojson',
  'manifest.json'
];

// Install: Cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching core assets v2');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch strategy: Network first for JSON/GeoJSON data, Cache first for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Network-first cho dữ liệu JSON / GeoJSON
  if (url.pathname.includes('/data/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first cho các tài nguyên tĩnh khác
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        });
      })
  );
});
