// Service Worker for caching IPFS images from Pinata gateway
// Cache version - increment this when you need to force cache refresh
const CACHE_VERSION = "v1";
const CACHE_NAME = `ipfs-images-${CACHE_VERSION}`;
const IPFS_GATEWAY_PATTERN = "gateway.pinata.cloud/ipfs/";

// Install event - create cache when service worker is first installed
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Delete old cache versions
            return (
              cacheName.startsWith("ipfs-images-") && cacheName !== CACHE_NAME
            );
          })
          .map((cacheName) => {
            console.log("[Service Worker] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - intercept network requests and serve from cache when available
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // Only handle IPFS gateway requests
  if (url.includes(IPFS_GATEWAY_PATTERN)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // If found in cache, return it immediately (fast!)
        if (cachedResponse) {
          console.log("[Service Worker] Cache HIT:", url);
          return cachedResponse;
        }

        // If not in cache, fetch from network
        console.log("[Service Worker] Cache MISS, fetching:", url);
        return fetch(event.request)
          .then((response) => {
            // Only cache successful responses (status 200-299)
            if (
              !response ||
              response.status !== 200 ||
              response.type !== "basic"
            ) {
              return response;
            }

            // Clone the response (responses can only be read once)
            const responseToCache = response.clone();

            // Store in cache for next time
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
              console.log("[Service Worker] Cached:", url);
            });

            // Return the original response
            return response;
          })
          .catch((error) => {
            console.error("[Service Worker] Fetch failed:", error);
            // Return a fallback or error response
            throw error;
          });
      })
    );
  }
  // For non-IPFS requests, let browser handle normally
});

