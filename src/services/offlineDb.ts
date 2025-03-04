
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
    db = await openDB('offlineSync', 1, {
      upgrade(db) {
        // Create stores for each table we want to sync
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id' });
        }
        
        // Create stores for offline data
        if (!db.objectStoreNames.contains('checklists')) {
          db.createObjectStore('checklists', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('companies')) {
          db.createObjectStore('companies', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('inspections')) {
          db.createObjectStore('inspections', { keyPath: 'id' });
        }
      }
    });
    
    console.log('Offline database initialized');
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
    
    // Also save to the corresponding table for local use
    if (operation !== 'delete') {
      await db.put(table, data);
    } else {
      await db.delete(table, data.id);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to save for sync:', error);
    return false;
  }
}

export async function getOfflineData(table: string): Promise<any[]> {
  if (!db) {
    await initOfflineDb();
  }
  
  try {
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
