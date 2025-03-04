
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register service worker for cache control
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
        
        // Set up a refresh function in window object
        window.refreshApp = () => {
          if (registration.active) {
            registration.active.postMessage({ type: 'INVALIDATE_CACHE' });
            setTimeout(() => {
              window.location.reload();
            }, 500);
          } else {
            window.location.reload();
          }
        };
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
      
    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'CACHE_INVALIDATED') {
        console.log('Cache has been invalidated by service worker');
      }
    });
  });
}

// Add versioning function to help with cache invalidation
window.versionedUrl = (url) => {
  const APP_VERSION = '1.0.0';
  const timestamp = new Date().getTime();
  return `${url}?v=${APP_VERSION}&t=${timestamp}`;
};

// Add version and last build date to help with cache invalidation
const APP_VERSION = '1.0.0';
const BUILD_DATE = new Date().toISOString();
console.log(`App Version: ${APP_VERSION}, Build Date: ${BUILD_DATE}`);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
