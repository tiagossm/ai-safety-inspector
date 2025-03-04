
// Service Worker Manager for the SafetyBPM app
// This file registers the service worker and manages cache invalidation

const CACHE_NAME = 'safetybpm-cache-v2';

// List of assets to pre-cache
const ASSETS = [
  '/',
  '/index.html',
  '/main.js',
  '/styles.css'
];

// Register service worker and set up listeners
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      // Check if service worker is already registered
      const registrations = await navigator.serviceWorker.getRegistrations();
      const existingWorker = registrations.find(r => 
        r.scope.includes(window.location.origin)
      );
      
      if (existingWorker) {
        console.log('Service worker already registered with scope:', existingWorker.scope);
        return existingWorker;
      }
      
      // Register new service worker
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });
      
      console.log('Service Worker registered with scope:', registration.scope);
      
      // Set up cache management
      setupCacheManagement(registration);
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  
  return null;
}

// Set up cache management functions
function setupCacheManagement(registration: ServiceWorkerRegistration) {
  // Function to refresh app and invalidate cache
  window.refreshApp = () => {
    if (registration.active) {
      // Send message to service worker to invalidate cache
      registration.active.postMessage({ type: 'INVALIDATE_CACHE' });
      
      // Reload page after a small delay
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      // If no active service worker, just reload
      window.location.reload();
    }
  };
  
  // Listen for messages from service worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CACHE_INVALIDATED') {
      console.log('Cache has been invalidated by service worker');
    }
  });
}

// Function to check if the URL is valid for caching
export function isValidCacheUrl(url: string): boolean {
  // Only cache HTTP/HTTPS URLs or relative URLs
  return url.startsWith('http') || url.startsWith('/');
}

// Create a service worker code string that can be used for development
export function getServiceWorkerCode(): string {
  return `
// SafetyBPM Service Worker v2
// Generated on ${new Date().toISOString()}

const CACHE_NAME = '${CACHE_NAME}';
const ASSETS = ${JSON.stringify(ASSETS)};

// Installation event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Filter valid assets (HTTP/HTTPS or relative URLs)
      const validAssets = ASSETS.filter(url => 
        url.startsWith('http') || url.startsWith('/')
      );
      return cache.addAll(validAssets);
    })
  );
  
  // Activate immediately
  self.skipWaiting();
});

// Activation event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  
  // Take control of all clients
  self.clients.claim();
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  // Ignore non-HTTP/HTTPS requests (chrome-extension:, file:, etc.)
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  // Ignore POST/PUT/DELETE requests (they can't be safely cached)
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached response and update cache in background
        const fetchPromise = fetch(event.request)
          .then(response => {
            // Only cache valid responses with 200 status
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // Network error, just use cache
            console.log('Network fetch failed, using cache for:', event.request.url);
          });
          
        // Return cached response immediately
        return cachedResponse;
      }
      
      // No cache match, fetch from network
      return fetch(event.request)
        .then(response => {
          // Clone the response before using it
          const responseClone = response.clone();
          
          // Only cache valid responses
          if (response.status === 200) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          
          return response;
        });
    })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'INVALIDATE_CACHE') {
    // Clear the cache
    caches.delete(CACHE_NAME).then(() => {
      // Notify client that cache was invalidated
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'CACHE_INVALIDATED' });
        });
      });
    });
  }
});
  `;
}

// Function to manually install a service worker - useful for development
export async function installServiceWorkerForDev(): Promise<boolean> {
  try {
    const blob = new Blob([getServiceWorkerCode()], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    
    const registration = await navigator.serviceWorker.register(url, {
      scope: '/'
    });
    
    // Revoke the object URL since the registration is complete
    URL.revokeObjectURL(url);
    
    console.log('Development service worker installed successfully');
    setupCacheManagement(registration);
    return true;
  } catch (error) {
    console.error('Failed to install development service worker:', error);
    return false;
  }
}
