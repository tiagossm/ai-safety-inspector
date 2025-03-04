
// Version of the cache (update this when deploying new versions)
const CACHE_VERSION = '1.0.0';
const CACHE_NAME = `app-cache-v${CACHE_VERSION}`;

// App shell files to cache on install
const CACHE_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  // Static assets will be added dynamically with versionedUrl
];

// Install event - cache app shell
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing new version:', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(CACHE_ASSETS);
      })
      .then(() => {
        console.log('[ServiceWorker] Skip waiting on install');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  
  // Immediately claim clients so the new service worker takes effect
  return self.clients.claim();
});

// Helper function to determine if a request is for an API or static asset
function isApiRequest(url) {
  return url.pathname.startsWith('/api') || 
         url.hostname.includes('supabase.co');
}

// Helper function to determine if an asset should be cached
function isCacheableAsset(url) {
  const fileExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.woff', '.woff2'];
  return fileExtensions.some(ext => url.pathname.endsWith(ext));
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  
  // Try to get from cache first
  const cachedResponse = await cache.match(request);
  
  // Fetch a fresh version in the background
  const fetchPromise = fetch(request)
    .then(response => {
      // Check if we received a valid response
      if (response && response.status === 200) {
        // Clone the response since we're going to use it twice
        const responseToCache = response.clone();
        // Put the fresh response in cache
        cache.put(request, responseToCache);
      }
      return response;
    })
    .catch(error => {
      console.log('[ServiceWorker] Fetch failed:', error);
      // If offline and no cached response, this will still throw
    });
  
  // Return the cached response if we have one, otherwise wait for the network response
  return cachedResponse || fetchPromise;
}

// Network-first strategy for API requests
async function networkFirst(request) {
  try {
    // Try network first
    const response = await fetch(request);
    return response;
  } catch (error) {
    console.log('[ServiceWorker] Network request failed, trying cache', error);
    // If network fails, try cache
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // If neither works, throw error
    throw error;
  }
}

// Fetch event - intercept and apply caching strategies
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Don't cache requests with Supabase API key
  if (url.toString().includes('apikey=')) {
    return;
  }
  
  // Special handling for versioned URLs (they should be cached aggressively)
  if (url.search.includes('v=') && url.search.includes('t=')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
          if (response) {
            return response; // Return cached version directly
          }
          return fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }
  
  // API requests use network-first
  if (isApiRequest(url)) {
    event.respondWith(networkFirst(event.request));
    return;
  }
  
  // Static assets use stale-while-revalidate
  if (isCacheableAsset(url)) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }
  
  // HTML requests should be network-first for new content
  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request));
    return;
  }
  
  // Default to network with cache fallback
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'INVALIDATE_CACHE') {
    console.log('[ServiceWorker] Received cache invalidation request');
    
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return cache.keys().then(keys => {
          // Only clear non-versioned assets
          const keysToDelete = keys.filter(request => {
            const url = new URL(request.url);
            return !url.search.includes('v=') || !url.search.includes('t=');
          });
          
          return Promise.all(
            keysToDelete.map(request => cache.delete(request))
          ).then(() => {
            console.log(`[ServiceWorker] Cleared ${keysToDelete.length} cached items`);
            // Notify all clients that cache was invalidated
            return self.clients.matchAll().then(clients => {
              clients.forEach(client => {
                client.postMessage({
                  type: 'CACHE_INVALIDATED',
                  timestamp: new Date().getTime()
                });
              });
            });
          });
        });
      })
    );
  }
});
