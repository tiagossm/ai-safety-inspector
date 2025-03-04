
// Service worker code generator

import { getCacheName, getAssetsList } from './cacheUtils';

/**
 * Create a service worker code string that can be used for development
 */
export function getServiceWorkerCode(): string {
  const CACHE_NAME = getCacheName();
  const ASSETS = getAssetsList();

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

// Add sync event for offline data
self.addEventListener('sync', (event) => {
  console.log('[SW] Sync event triggered:', event.tag);
  
  if (event.tag === 'sync-pending-data') {
    event.waitUntil(
      syncPendingData().then(result => {
        console.log('[SW] Sync result:', result);
      })
    );
  }
});

// Function to sync pending data
async function syncPendingData() {
  try {
    // Fetch the IndexedDB data
    const dbName = 'offlineSync';
    const request = indexedDB.open(dbName, 1);
    
    return new Promise((resolve, reject) => {
      request.onerror = () => {
        console.error('[SW] Failed to open IndexedDB for sync');
        resolve({ success: false, message: 'Failed to open IndexedDB' });
      };
      
      request.onsuccess = (event) => {
        const db = request.result;
        const transaction = db.transaction('pendingRequests', 'readonly');
        const store = transaction.objectStore('pendingRequests');
        const countRequest = store.count();
        
        countRequest.onsuccess = () => {
          const count = countRequest.result;
          
          if (count === 0) {
            console.log('[SW] No pending requests to sync');
            resolve({ success: true, message: 'No pending requests to sync' });
            return;
          }
          
          console.log('[SW] Found', count, 'pending requests to sync');
          // The actual sync will be handled by the syncManager.ts
          // This just notifies the main thread that sync is needed
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({ type: 'SYNC_NEEDED' });
            });
          });
          
          resolve({ success: true, message: 'Sync notification sent' });
        };
        
        countRequest.onerror = () => {
          console.error('[SW] Failed to count pending requests');
          resolve({ success: false, message: 'Failed to count pending requests' });
        };
      };
    });
  } catch (error) {
    console.error('[SW] Error in syncPendingData:', error);
    return { success: false, message: error.message };
  }
}
`;
}
