
// This file re-exports all offline sync functionality from the modular files
import { initOfflineDb, saveForSync, getOfflineData } from './offlineDb';
import { syncWithServer } from './syncManager';
import { getValidatedTable, isValidTable, isOfflineStore, type AllowedTableName } from './tableValidation';
import { toast } from "sonner";

// Define the initOfflineSystem function properly
function initOfflineSystem(
  onlineStatusCallback?: (isOnline: boolean) => void,
  syncCallback?: (isSyncing: boolean) => void,
  errorCallback?: (error: Error) => void
) {
  let isInitialized = false;
  let initializationPromise: Promise<boolean> | null = null;

  // Define event listeners for online/offline status
  const handleOnlineStatus = () => {
    const isOnline = navigator.onLine;
    console.log(`Network status changed: ${isOnline ? 'online' : 'offline'}`);
    
    if (onlineStatusCallback) {
      onlineStatusCallback(isOnline);
    }
    
    // If we're back online, try to sync
    if (isOnline && isInitialized) {
      try {
        syncWithServer(
          syncCallback,
          (error) => {
            console.error("Sync error:", error);
            if (errorCallback) errorCallback(error);
          }
        ).catch(error => {
          console.error("Unhandled error during sync:", error);
          toast.error("Falha na sincronização. Por favor, recarregue a página.");
        });
      } catch (error) {
        console.error("Critical error in sync process:", error);
        toast.error("Erro crítico na sincronização. Algumas funcionalidades podem não estar disponíveis.");
      }
    }
  };

  // Setup event listeners
  window.addEventListener('online', handleOnlineStatus);
  window.addEventListener('offline', handleOnlineStatus);
  
  // Initialize offline database
  if (!initializationPromise) {
    console.log("Starting offline database initialization...");
    initializationPromise = initOfflineDb().then(success => {
      isInitialized = success;
      console.log(`IndexedDB initialization ${success ? 'succeeded' : 'failed'}`);
      
      // Initial sync check - only if successfully initialized
      if (success && navigator.onLine) {
        try {
          syncWithServer(syncCallback, errorCallback)
            .catch(error => {
              console.error("Unhandled error during initial sync:", error);
              toast.error("Falha na sincronização inicial. Algumas funcionalidades podem não estar disponíveis.");
            });
        } catch (error) {
          console.error("Critical error in initial sync process:", error);
          toast.error("Erro crítico na sincronização inicial. Reinicie a aplicação.");
        }
      }
      return success;
    }).catch(error => {
      console.error("Failed to initialize IndexedDB:", error);
      toast.error("Falha ao inicializar o banco de dados offline. Algumas funcionalidades podem não estar disponíveis.");
      return false;
    });
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
  isValidTable,
  isOfflineStore,
  type AllowedTableName
};
