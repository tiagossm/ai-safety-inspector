
import { openDB, IDBPDatabase } from 'idb';

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
    db = await openDB('offlineSync', 3, {  // Increased to version 3
      upgrade(db, oldVersion, newVersion) {
        console.log(`Upgrading IndexedDB from version ${oldVersion} to ${newVersion}`);

        // Store for synchronization
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id' });
        }

        // Ensure all necessary stores are created
        const stores = [
          'checklists',
          'users',
          'companies',
          'inspections',
          'checklist_itens',
          'user_checklists',
          'checklist_permissions',
          'user_companies'
        ];

        stores.forEach(storeName => {
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

// Add the rest of the functions
export async function saveForSync(table: string, operation: 'insert' | 'update' | 'delete', data: any) {
  try {
    if (!db) {
      await initOfflineDb();
    }
    
    const syncItem: SyncItem = {
      id: `${table}_${operation}_${data.id}_${Date.now()}`,
      table,
      operation,
      data,
      timestamp: Date.now()
    };
    
    const tx = db.transaction('syncQueue', 'readwrite');
    await tx.store.add(syncItem);
    
    // Also save/update the local data for offline access
    if (operation !== 'delete') {
      const dataTx = db.transaction(table, 'readwrite');
      await dataTx.store.put(data);
    } else if (operation === 'delete') {
      try {
        const dataTx = db.transaction(table, 'readwrite');
        await dataTx.store.delete(data.id);
      } catch (deleteError) {
        console.warn(`Could not delete from local store: ${deleteError}`);
      }
    }
    
    return syncItem.id;
  } catch (error) {
    console.error(`Error saving item for sync: ${error}`);
    throw error;
  }
}

export async function getSyncQueue() {
  try {
    if (!db) {
      await initOfflineDb();
    }
    
    const tx = db.transaction('syncQueue', 'readonly');
    return await tx.store.getAll();
  } catch (error) {
    console.error(`Error getting sync queue: ${error}`);
    return [];
  }
}

export async function clearSyncItem(id: string) {
  try {
    if (!db) {
      await initOfflineDb();
    }
    
    const tx = db.transaction('syncQueue', 'readwrite');
    await tx.store.delete(id);
  } catch (error) {
    console.error(`Error clearing sync item: ${error}`);
    throw error;
  }
}

export async function getOfflineData(table: string) {
  try {
    if (!db) {
      await initOfflineDb();
    }
    
    const tx = db.transaction(table, 'readonly');
    return await tx.store.getAll();
  } catch (error) {
    console.error(`Error getting offline data for ${table}: ${error}`);
    return [];
  }
}
