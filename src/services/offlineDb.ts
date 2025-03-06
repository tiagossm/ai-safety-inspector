
// Only updating the SyncItem interface to use lowercase operation types
import { openDB, IDBPDatabase } from 'idb';

// Define interface for sync item
interface SyncItem {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

let db: IDBPDatabase;

export async function initOfflineDb() {
  try {
    // Increment the version number to force schema update
    db = await openDB('offlineSync', 3, {
      upgrade(db, oldVersion, newVersion, transaction) {
        console.log(`Upgrading IndexedDB from version ${oldVersion} to ${newVersion}`);
        
        // Create stores for sync queue
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id' });
        }
        
        // Create stores for offline data - main entities
        const mainStores = [
          'checklists',
          'users',
          'companies', 
          'inspections',
          'checklist_itens',   // Adding this missing store
          'user_checklists',   // Adding this missing store
          'checklist_permissions' // Adding this missing store
        ];
        
        mainStores.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            console.log(`Creating object store: ${storeName}`);
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        });
      }
    });
    
    console.log('Offline database initialized with stores:', Array.from(db.objectStoreNames));
    return true;
  } catch (error) {
    console.error('Failed to initialize offline database:', error);
    return false;
  }
}

export async function saveForSync(
  table: string,
  operation: 'insert' | 'update' | 'delete',
  data: any
): Promise<boolean> {
  if (!db) {
    await initOfflineDb();
  }
  
  try {
    const syncItem: SyncItem = {
      id: `${table}_${data.id}_${Date.now()}`,
      table,
      operation,
      data,
      timestamp: Date.now()
    };
    
    // Save to sync queue
    await db.put('syncQueue', syncItem);
    
    // Ensure the table exists in our schema before attempting to put data in it
    if (!db.objectStoreNames.contains(table)) {
      console.warn(`Object store "${table}" not found. Data will be in sync queue but not locally available.`);
      return true; // We still return true as we added it to the sync queue
    }
    
    // Also save to the corresponding table for local use
    if (operation !== 'delete') {
      await db.put(table, data);
    } else {
      await db.delete(table, data.id);
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to save for sync (table: ${table}):`, error);
    return false;
  }
}

export async function getOfflineData(table: string): Promise<any[]> {
  if (!db) {
    await initOfflineDb();
  }
  
  try {
    // Check if the object store exists
    if (!db.objectStoreNames.contains(table)) {
      console.warn(`Object store "${table}" not found when trying to get offline data.`);
      return []; // Return empty array if store doesn't exist
    }
    
    return await db.getAll(table);
  } catch (error) {
    console.error(`Failed to get offline data for ${table}:`, error);
    return [];
  }
}

export async function getSyncQueue(): Promise<SyncItem[]> {
  if (!db) {
    await initOfflineDb();
  }
  
  try {
    return await db.getAll('syncQueue');
  } catch (error) {
    console.error('Failed to get sync queue:', error);
    return [];
  }
}

export async function clearSyncItem(id: string): Promise<boolean> {
  if (!db) {
    await initOfflineDb();
  }
  
  try {
    await db.delete('syncQueue', id);
    return true;
  } catch (error) {
    console.error('Failed to clear sync item:', error);
    return false;
  }
}
