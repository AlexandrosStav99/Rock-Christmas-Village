const CACHE_NAME = 'rcv-precache-v2'; 

// Only cache files that definitely exist
const PRECACHE_URLS = [
  "../../",
  "../../index.html",
  "../assets/css/style.css",
  "./assets/js/script.js",
  "./assets/js/footer.js",
  "../../Images/logo-maroon.png",
  "../../Images/og-image-main-branded.png", // ← NEW: Add branded OG image
  "../../Images/og-image-twitter-branded.png", // ← NEW: Add Twitter image
  "../../Images/og-image-square-branded.png", // ← NEW: Add square image (optional)
  "../..//manifest.webmanifest",
];
// Install event - cache files
self.addEventListener("install", (event) => {
  console.log("[SW] Installing Service Worker v2...");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching files...");

        // Cache each file individually so one failure doesn't break everything
        const cachePromises = PRECACHE_URLS.map((url) => {
          return cache
            .add(url)
            .then(() => {
              console.log("[SW] ✅ Cached:", url);
            })
            .catch((err) => {
              console.warn("[SW] ⚠️ Failed to cache:", url, "-", err.message);
            });
        });

        return Promise.all(cachePromises);
      })
      .then(() => {
        console.log("[SW] Installation complete!");
        return self.skipWaiting();
      })
  );
});

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating Service Worker v2...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("[SW] ✅ Service Worker activated!");
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  // Skip non-http requests
  if (!event.request.url.startsWith("http")) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached version if available
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise fetch from network
      return fetch(event.request)
        .then((response) => {
          // Check if valid response
          if (
            !response ||
            response.status !== 200 ||
            response.type === "error"
          ) {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache static assets
          const url = new URL(event.request.url);
          if (
            /\.(css|js|png|jpg|jpeg|webp|svg|gif|ico|woff|woff2|ttf)$/i.test(
              url.pathname
            )
          ) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }

          return response;
        })
        .catch(() => {
          // Network failed, try to return cached version
          return caches.match(event.request);
        });
    })
  );
});