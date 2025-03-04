
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { toast } from 'sonner';

// Define our database schema
interface OfflineSyncDB extends DBSchema {
  pendingRequests: {
    key: string;
    value: {
      id: string;
      table: string;
      operation: 'INSERT' | 'UPDATE' | 'DELETE';
      data: any;
      timestamp: number;
      retries: number;
    };
    indexes: { 'by-table': string };
  };
  offlineData: {
    key: string;
    value: {
      table: string;
      id: string;
      data: any;
      lastUpdated: number;
    };
    indexes: { 'by-table': string };
  };
}

// Database version
const DB_VERSION = 1;
const DB_NAME = 'offlineSync';

let db: IDBPDatabase<OfflineSyncDB> | null = null;

// Initialize the database
export async function initOfflineDb() {
  if (db) return db;
  
  console.log('Initializing offline database...');
  
  try {
    db = await openDB<OfflineSyncDB>(DB_NAME, DB_VERSION, {
      upgrade(database) {
        // Create stores if they don't exist
        console.log('Upgrading database to version', DB_VERSION);
        
        if (!database.objectStoreNames.contains('pendingRequests')) {
          console.log('Creating pendingRequests store');
          const pendingRequestsStore = database.createObjectStore('pendingRequests', { keyPath: 'id' });
          pendingRequestsStore.createIndex('by-table', 'table');
        }
        
        if (!database.objectStoreNames.contains('offlineData')) {
          console.log('Creating offlineData store');
          const offlineDataStore = database.createObjectStore('offlineData', { keyPath: 'id' });
          offlineDataStore.createIndex('by-table', 'table');
        }
      }
    });
    
    console.log('Offline database initialized successfully');
    return db;
  } catch (error) {
    console.error('Failed to initialize offline database:', error);
    toast.error('Failed to initialize offline storage. Some features may not work correctly.');
    throw error;
  }
}

// Save data to be synced later
export async function saveForSync(
  table: string, 
  operation: 'INSERT' | 'UPDATE' | 'DELETE', 
  data: any
) {
  console.log(`Saving ${operation} operation for ${table} to be synced later:`, data);
  
  try {
    const database = await initOfflineDb();
    
    const requestId = `${table}_${operation}_${data.id || Date.now()}`;
    
    await database.put('pendingRequests', {
      id: requestId,
      table,
      operation,
      data,
      timestamp: Date.now(),
      retries: 0
    });
    
    // If it's not a DELETE operation, update the offlineData store
    if (operation !== 'DELETE') {
      await database.put('offlineData', {
        table,
        id: data.id || requestId,
        data,
        lastUpdated: Date.now()
      });
      console.log(`Saved ${operation} data to offline storage for ${table}`);
    } else if (data.id) {
      // For DELETE operations, remove from offlineData
      try {
        await database.delete('offlineData', data.id);
        console.log(`Marked item for deletion in offline storage: ${table} ID:${data.id}`);
      } catch (error) {
        console.error('Error deleting from offlineData:', error);
      }
    }
    
    // Trigger a sync registration if available
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        // Check if SyncManager is available
        if ('sync' in registration) {
          registration.sync.register('sync-pending-data')
            .then(() => console.log('Registered for background sync'))
            .catch(err => console.error('Background sync registration failed:', err));
        } else {
          console.log('SyncManager not available in this browser');
        }
      });
    }
    
    return requestId;
  } catch (error) {
    console.error(`Error saving ${operation} operation for ${table}:`, error);
    toast.error(`Failed to save offline data. Please try again.`);
    throw error;
  }
}

// Get data that was saved offline
export async function getOfflineData(table: string) {
  try {
    const database = await initOfflineDb();
    
    const tableIndex = database.transaction('offlineData').store.index('by-table');
    const data = await tableIndex.getAll(table);
    
    console.log(`Retrieved ${data.length} offline items for ${table}`);
    return data;
  } catch (error) {
    console.error(`Error getting offline data for ${table}:`, error);
    return [];
  }
}

// Get all pending requests
export async function getPendingRequests() {
  try {
    const database = await initOfflineDb();
    const requests = await database.getAll('pendingRequests');
    console.log(`Retrieved ${requests.length} pending requests for sync`);
    return requests;
  } catch (error) {
    console.error('Error getting pending requests:', error);
    return [];
  }
}

// Get pending requests for a specific table
export async function getPendingRequestsByTable(table: string) {
  try {
    const database = await initOfflineDb();
    const index = database.transaction('pendingRequests').store.index('by-table');
    const requests = await index.getAll(table);
    console.log(`Retrieved ${requests.length} pending requests for table ${table}`);
    return requests;
  } catch (error) {
    console.error(`Error getting pending requests for table ${table}:`, error);
    return [];
  }
}

// Remove a pending request
export async function removePendingRequest(id: string) {
  try {
    const database = await initOfflineDb();
    await database.delete('pendingRequests', id);
    console.log(`Removed pending request: ${id}`);
  } catch (error) {
    console.error(`Error removing pending request ${id}:`, error);
    throw error;
  }
}

// Update retry count for a request
export async function incrementRetryCount(request: any) {
  try {
    const database = await initOfflineDb();
    request.retries++;
    await database.put('pendingRequests', request);
    console.log(`Incremented retry count for request ${request.id} to ${request.retries}`);
  } catch (error) {
    console.error(`Error incrementing retry count for request ${request.id}:`, error);
    throw error;
  }
}

// Initialize the database system
export function initOfflineSystem() {
  console.log('Initializing offline system...');
  
  initOfflineDb();
  return initOnlineSync();
}

// Check for sync when online
export function initOnlineSync() {
  let cleanup: (() => void) | null = null;
  
  // We will import this function dynamically to avoid circular dependencies
  import('./syncManager').then(({ syncWithServer, registerSyncEvents }) => {
    const handleOnline = () => {
      console.log('Back online, attempting to sync');
      syncWithServer().then(result => {
        console.log('Sync result:', result);
      });
    };
    
    // Register for sync events
    registerSyncEvents();
    
    window.addEventListener('online', handleOnline);
    
    // Also check if we're already online
    if (navigator.onLine) {
      // Wait a bit to make sure we're properly connected
      setTimeout(handleOnline, 3000);
    }
    
    cleanup = () => {
      window.removeEventListener('online', handleOnline);
    };
  });
  
  return () => {
    if (cleanup) cleanup();
  };
}

// Debug function to view all stored data
export async function debugViewAllData() {
  try {
    const database = await initOfflineDb();
    
    const pendingRequests = await database.getAll('pendingRequests');
    const offlineData = await database.getAll('offlineData');
    
    return {
      pendingRequests,
      offlineData
    };
  } catch (error) {
    console.error('Error debugging offline data:', error);
    return {
      pendingRequests: [],
      offlineData: []
    };
  }
}
