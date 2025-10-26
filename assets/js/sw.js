const CACHE_NAME = 'rcv-precache-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/assets/css/style.merged.min.css',
  '/assets/js/script.js',
  '/assets/js/footer.js',
  '/Images/logo-maroon.png',
  '/Images/logo-cream.png',
  '/manifest.webmanifest'
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // console.log('[SW] Caching precache resources');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              // console.log('[SW] Deleting old cache:', key);
              return caches.delete(key);
            }
            return null;
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Only handle GET requests
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request)
      .then((cached) => {
        if (cached) {
          // console.log('[SW] Serving from cache:', request.url);
          return cached;
        }
        
        // Not in cache, fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Cache CSS/JS/Images for next time
            const cloned = response.clone();
            const url = new URL(request.url);
            
            if (/\.(css|js|png|jpg|jpeg|webp|svg|gif|woff|woff2|ttf|otf)$/i.test(url.pathname)) {
              caches.open(CACHE_NAME).then((cache) => {
                // console.log('[SW] Caching new resource:', request.url);
                cache.put(request, cloned);
              });
            }
            
            return response;
          })
          .catch(() => {
            // console.log('[SW] Fetch failed, returning cached version if available');
            return cached;
          });
      })
  );
});