
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initOfflineSystem } from './services/offlineSync';
import { registerServiceWorker } from './services/serviceWorkerManager';

// App version for cache control
const APP_VERSION = '1.0.2';
const BUILD_DATE = new Date().toISOString();

// Initialize offline system
const cleanupOfflineSystem = initOfflineSystem();

// Register service worker for cache control
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    registerServiceWorker()
      .then(registration => {
        console.log('Service Worker registered with scope:', registration?.scope);
        
        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'CACHE_INVALIDATED') {
            console.log('Cache has been invalidated by service worker');
          }
        });
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
