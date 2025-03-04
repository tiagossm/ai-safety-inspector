
import { supabase } from "@/integrations/supabase/client";
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { toast } from "sonner";

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

// Maximum retry attempts
const MAX_RETRIES = 5;

let db: IDBPDatabase<OfflineSyncDB> | null = null;

// List of allowed table names for type safety
const ALLOWED_TABLES = [
  "companies",
  "users",
  "checklists",
  "checklist_itens",
  "inspections",
  "inspection_responses",
  "units",
  "platform",
  "automated_incidents",
  "checklist_assignments"
] as const;

type AllowedTableName = typeof ALLOWED_TABLES[number];

// Helper to check if a table name is valid
function isValidTable(tableName: string): tableName is AllowedTableName {
  return ALLOWED_TABLES.includes(tableName as AllowedTableName);
}

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

// Synchronize all pending requests with the server
export async function syncWithServer() {
  if (!navigator.onLine) {
    console.log('Cannot sync while offline');
    return { success: false, message: 'Cannot sync while offline' };
  }
  
  const database = await initOfflineDb();
  
  // Get all pending requests
  const pendingRequests = await database.getAll('pendingRequests');
  
  if (pendingRequests.length === 0) {
    console.log('No pending requests to sync');
    return { success: true, message: 'No pending requests to sync' };
  }
  
  console.log(`Syncing ${pendingRequests.length} pending requests`);
  
  let successCount = 0;
  let failureCount = 0;
  
  // Process each request
  for (const request of pendingRequests) {
    try {
      let result;
      
      // Skip if max retries reached
      if (request.retries >= MAX_RETRIES) {
        console.error(`Request ${request.id} has reached max retries, will be skipped`);
        failureCount++;
        continue;
      }
      
      // Execute the request - with type checking for table names
      if (!isValidTable(request.table)) {
        throw new Error(`Invalid table name: ${request.table}`);
      }
      
      switch (request.operation) {
        case 'INSERT':
          result = await supabase
            .from(request.table)
            .insert(request.data);
          break;
        case 'UPDATE':
          result = await supabase
            .from(request.table)
            .update(request.data)
            .eq('id', request.data.id);
          break;
        case 'DELETE':
          result = await supabase
            .from(request.table)
            .delete()
            .eq('id', request.data.id);
          break;
      }
      
      if (result.error) {
        throw result.error;
      }
      
      // If successful, remove from pending requests
      await database.delete('pendingRequests', request.id);
      successCount++;
      
    } catch (error) {
      console.error(`Error syncing request ${request.id}:`, error);
      
      // Increment retry count
      request.retries++;
      await database.put('pendingRequests', request);
      failureCount++;
    }
  }
  
  const result = {
    success: failureCount === 0,
    message: `Sync completed: ${successCount} succeeded, ${failureCount} failed`
  };
  
  if (failureCount > 0) {
    toast.error(`Sync partially completed. ${failureCount} items failed to sync.`);
  } else if (successCount > 0) {
    toast.success(`Sync completed successfully. ${successCount} items synced.`);
  }
  
  console.log(result.message);
  return result;
}

// Check for sync when online
export function initOnlineSync() {
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
  
  return () => {
    window.removeEventListener('online', handleOnline);
  };
}

// Offline-capable version of supabase operations
export const offlineSupabase = {
  from: (table: string) => {
    // Type check the table name
    if (!isValidTable(table)) {
      console.error(`Invalid table name: ${table}`);
      // Return a dummy object that won't crash but will fail gracefully
      return {
        insert: async () => ({ data: null, error: new Error(`Invalid table: ${table}`) }),
        update: async () => ({ 
          eq: async () => ({ data: null, error: new Error(`Invalid table: ${table}`) }) 
        }),
        delete: async () => ({ 
          eq: async () => ({ data: null, error: new Error(`Invalid table: ${table}`) }) 
        }),
        select: async () => ({ data: [], error: new Error(`Invalid table: ${table}`) })
      };
    }
    
    const typedTable = table as AllowedTableName;
    
    return {
      insert: async (data: any) => {
        try {
          if (navigator.onLine) {
            const result = await supabase.from(typedTable).insert(data);
            if (result.error) throw result.error;
            return result;
          } else {
            // Generate a temporary ID if none exists
            if (!data.id) {
              data.id = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            }
            await saveForSync(typedTable, 'INSERT', data);
            return { data: [data], error: null };
          }
        } catch (error) {
          console.error(`Error in offline insert for ${typedTable}:`, error);
          // Always fall back to offline storage on error
          await saveForSync(typedTable, 'INSERT', data);
          return { data: [data], error: null };
        }
      },
      
      update: async (data: any) => ({
        eq: async (column: string, value: any) => {
          try {
            if (navigator.onLine) {
              const result = await supabase.from(typedTable).update(data).eq(column, value);
              if (result.error) throw result.error;
              return result;
            } else {
              // For offline update, we need the ID
              if (column === 'id') {
                data.id = value;
              }
              await saveForSync(typedTable, 'UPDATE', data);
              return { data: [data], error: null };
            }
          } catch (error) {
            console.error(`Error in offline update for ${typedTable}:`, error);
            // Always fall back to offline storage on error
            if (column === 'id') {
              data.id = value;
            }
            await saveForSync(typedTable, 'UPDATE', data);
            return { data: [data], error: null };
          }
        }
      }),
      
      delete: async () => ({
        eq: async (column: string, value: any) => {
          try {
            if (navigator.onLine) {
              const result = await supabase.from(typedTable).delete().eq(column, value);
              if (result.error) throw result.error;
              return result;
            } else {
              // For delete we just need the ID
              const data = { id: value };
              await saveForSync(typedTable, 'DELETE', data);
              return { data: [], error: null };
            }
          } catch (error) {
            console.error(`Error in offline delete for ${typedTable}:`, error);
            // Always fall back to offline storage on error
            const data = { id: value };
            await saveForSync(typedTable, 'DELETE', data);
            return { data: [], error: null };
          }
        }
      }),
      
      select: async (columns: string = '*') => {
        try {
          if (navigator.onLine) {
            return await supabase.from(typedTable).select(columns);
          } else {
            // When offline, use local data
            const offlineData = await getOfflineData(typedTable);
            return { 
              data: offlineData.map(item => item.data), 
              error: null 
            };
          }
        } catch (error) {
          console.error(`Error in offline select for ${typedTable}:`, error);
          // On error, try to use offline data as fallback
          const offlineData = await getOfflineData(typedTable);
          return { 
            data: offlineData.map(item => item.data), 
            error: null 
          };
        }
      }
    };
  }
};

// Initialize system
export function initOfflineSystem() {
  initOfflineDb();
  return initOnlineSync();
}
