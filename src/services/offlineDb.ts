
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
  
  db = await openDB<OfflineSyncDB>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      // Create stores if they don't exist
      if (!database.objectStoreNames.contains('pendingRequests')) {
        const pendingRequestsStore = database.createObjectStore('pendingRequests', { keyPath: 'id' });
        pendingRequestsStore.createIndex('by-table', 'table');
      }
      
      if (!database.objectStoreNames.contains('offlineData')) {
        const offlineDataStore = database.createObjectStore('offlineData', { keyPath: 'id' });
        offlineDataStore.createIndex('by-table', 'table');
      }
    }
  });
  
  console.log('Offline database initialized');
  return db;
}

// Save data to be synced later
export async function saveForSync(
  table: string, 
  operation: 'INSERT' | 'UPDATE' | 'DELETE', 
  data: any
) {
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
  } else if (data.id) {
    // For DELETE operations, remove from offlineData
    try {
      await database.delete('offlineData', data.id);
    } catch (error) {
      console.error('Error deleting from offlineData:', error);
    }
  }
  
  console.log(`Saved ${operation} operation for ${table} to be synced later`);
  return requestId;
}

// Get data that was saved offline
export async function getOfflineData(table: string) {
  const database = await initOfflineDb();
  
  const tableIndex = database.transaction('offlineData').store.index('by-table');
  return await tableIndex.getAll(table);
}

// Get all pending requests
export async function getPendingRequests() {
  const database = await initOfflineDb();
  return await database.getAll('pendingRequests');
}

// Remove a pending request
export async function removePendingRequest(id: string) {
  const database = await initOfflineDb();
  await database.delete('pendingRequests', id);
}

// Update retry count for a request
export async function incrementRetryCount(request: any) {
  const database = await initOfflineDb();
  request.retries++;
  await database.put('pendingRequests', request);
}

// Initialize the database system
export function initOfflineSystem() {
  initOfflineDb();
  return initOnlineSync();
}

// Check for sync when online
export function initOnlineSync() {
  let cleanup: (() => void) | null = null;
  
  // We will import this function dynamically to avoid circular dependencies
  import('./syncManager').then(({ syncWithServer }) => {
    const handleOnline = () => {
      console.log('Back online, attempting to sync');
      syncWithServer().then(result => {
        console.log('Sync result:', result);
      });
    };
    
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
