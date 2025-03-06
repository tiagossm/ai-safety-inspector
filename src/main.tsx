
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initOfflineSystem } from './services/offlineSync';
import { initOfflineDb } from './services/offlineDb';

// Initialize offline database immediately 
initOfflineDb().then(success => {
  console.log(`IndexedDB initialization ${success ? 'succeeded' : 'failed'}`);
});

// Initialize offline system 
const cleanup = initOfflineSystem(
  (isOnline) => {
    console.log(`App is ${isOnline ? 'online' : 'offline'}`);
  },
  (isSyncing) => {
    console.log(`Sync status: ${isSyncing ? 'syncing' : 'idle'}`);
  },
  (error) => {
    console.error('Sync error:', error);
  }
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// We don't call cleanup() here as we want the offline system
// to run for the lifetime of the application
