
// Service Worker for cache management
const CACHE_NAME = 'safetybpm-cache-v1';

// Add an array of assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - with cache strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip navigation requests (HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For API requests, try network first, no cache
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('/rest/') || 
      event.request.url.includes('/graphql') ||
      event.request.url.includes('/functions/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // For static assets, use a stale-while-revalidate strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response immediately if available
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Update the cache with the new response
          if (networkResponse.ok) {
            const clonedResponse = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clonedResponse);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If both cache and network fail, return a fallback
          return new Response('Network error occurred', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' }
          });
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Listen for a message to invalidate cache
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'INVALIDATE_CACHE') {
    self.registration.update();
    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => {
        console.log('Cache cleared successfully');
        self.clients.matchAll().then(clients => {
          clients.forEach(client => client.postMessage({
            type: 'CACHE_INVALIDATED'
          }));
        });
      })
    );
  }
});
