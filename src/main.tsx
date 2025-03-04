
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initOfflineSystem } from './services/offlineSync';
import { registerServiceWorker } from './services/serviceWorkerManager';
import { toast } from 'sonner';

// App version for cache control
const APP_VERSION = '1.0.3'; // Incremented version
const BUILD_DATE = new Date().toISOString();

// Initialize offline system
const cleanupOfflineSystem = initOfflineSystem();

// Register service worker for cache control
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    registerServiceWorker()
      .then(registration => {
        if (registration) {
          console.log('Service Worker registered with scope:', registration.scope);
          
          // Listen for messages from service worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data) {
              if (event.data.type === 'CACHE_INVALIDATED') {
                console.log('Cache has been invalidated by service worker');
                toast.info('App cache cleared. Using the latest version.');
              } else if (event.data.type === 'SYNC_NEEDED') {
                console.log('Sync requested by service worker');
                toast.info('Syncing offline data...');
              }
            }
          });
        }
      })
      .catch(error => {
        console.error('Service worker registration failed:', error);
      });
      
    // Add global cleanup on unload
    window.addEventListener('beforeunload', () => {
      cleanupOfflineSystem();
    });
  });
}

// Add versioning function to help with cache invalidation
window.versionedUrl = (url) => {
  const timestamp = new Date().getTime();
  return `${url}?v=${APP_VERSION}&t=${timestamp}`;
};

// Log app version and build date
console.log(`App Version: ${APP_VERSION}, Build Date: ${BUILD_DATE}`);

// Add debug utility
window.checkConnection = () => {
  return {
    online: navigator.onLine,
    type: navigator.connection ? navigator.connection.type : 'unknown',
    version: APP_VERSION
  };
};

// Add debug function for offline data
window.debugOfflineData = async () => {
  const { debugViewAllData } = await import('./services/offlineDb');
  return await debugViewAllData();
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
