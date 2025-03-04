
// Core service worker registration functionality

/**
 * Register the service worker and return the registration
 */
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
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  
  return null;
}

/**
 * Set up cache management for the service worker
 */
export function setupCacheManagement(registration: ServiceWorkerRegistration) {
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
