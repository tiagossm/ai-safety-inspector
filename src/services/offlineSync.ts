
// This file re-exports all offline sync functionality from the modular files
import { initOfflineDb, saveForSync, getOfflineData } from './offlineDb';
import { syncWithServer } from './syncManager';
import { getValidatedTable, type AllowedTableName } from './tableValidation';

// Define the initOfflineSystem function properly
function initOfflineSystem(
  onlineStatusCallback?: (isOnline: boolean) => void,
  syncCallback?: (isSyncing: boolean) => void,
  errorCallback?: (error: Error) => void
) {
  // Define event listeners for online/offline status
  const handleOnlineStatus = () => {
    const isOnline = navigator.onLine;
    console.log(`Network status changed: ${isOnline ? 'online' : 'offline'}`);
    
    if (onlineStatusCallback) {
      onlineStatusCallback(isOnline);
    }
    
    // If we're back online, try to sync
    if (isOnline) {
      syncWithServer(
        syncCallback,
        errorCallback
      );
    }
  };

  // Setup event listeners
  window.addEventListener('online', handleOnlineStatus);
  window.addEventListener('offline', handleOnlineStatus);
  
  // Initialize offline database
  initOfflineDb();
  
  // Initial sync check
  if (navigator.onLine) {
    syncWithServer(syncCallback, errorCallback);
  }
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnlineStatus);
    window.removeEventListener('offline', handleOnlineStatus);
  };
}

// Re-export everything
export {
  initOfflineDb,
  saveForSync,
  getOfflineData,
  initOfflineSystem,
  syncWithServer,
  getValidatedTable,
  type AllowedTableName
};
