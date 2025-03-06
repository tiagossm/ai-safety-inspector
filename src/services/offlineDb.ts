
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
    db = await openDB('offlineSync', 4, {  // Increased version to 4 to accommodate changes
      upgrade(db, oldVersion, newVersion) {
        console.log(`Upgrading IndexedDB from version ${oldVersion} to ${newVersion}`);

        // Store para sincronização
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id' });
        }

        // Criação de stores para dados offline, conforme as tabelas permitidas
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

export async function getSyncQueue(): Promise<SyncItem[]> {
  if (!db) {
    console.warn('Offline database not initialized.');
    return [];
  }
  try {
    const tx = db.transaction('syncQueue', 'readonly');
    const store = tx.objectStore('syncQueue');
    return await store.getAll();
  } catch (error) {
    console.error('Failed to get sync queue:', error);
    return [];
  }
}

export async function clearSyncItem(id: string): Promise<void> {
  if (!db) {
    console.warn('Offline database not initialized.');
    return;
  }
  try {
    const tx = db.transaction('syncQueue', 'readwrite');
    const store = tx.objectStore('syncQueue');
    await store.delete(id);
    await tx.done;
    console.log(`Sync item ${id} cleared from queue.`);
  } catch (error) {
    console.error(`Failed to clear sync item ${id}:`, error);
  }
}

export async function saveForSync(
  table: string,
  operation: 'insert' | 'update' | 'delete',
  data: any
): Promise<void> {
  if (!db) {
    console.warn('Offline database not initialized.');
    return;
  }
  const id = `${Date.now()}-${Math.random()}`;
  const syncItem: SyncItem = {
    id: id,
    table: table,
    operation: operation,
    data: data,
    timestamp: Date.now(),
  };
  try {
    const tx = db.transaction('syncQueue', 'readwrite');
    const store = tx.objectStore('syncQueue');
    await store.add(syncItem);
    await tx.done;
    console.log(`Saved ${operation} operation for table ${table} in sync queue.`);

    // Also save the data in the respective offline store
    if (operation === 'insert' || operation === 'update') {
      await saveDataOffline(table, data);
    } else if (operation === 'delete') {
      await deleteDataOffline(table, data.id);
    }
  } catch (error) {
    console.error('Failed to save for sync:', error);
  }
}

async function saveDataOffline(table: string, data: any): Promise<void> {
  if (!db) {
    console.warn('Offline database not initialized.');
    return;
  }
  try {
    const tx = db.transaction(table, 'readwrite');
    const store = tx.objectStore(table);
    await store.put(data);
    await tx.done;
    console.log(`Saved data offline for table ${table}.`);
  } catch (error) {
    console.error(`Failed to save data offline for table ${table}:`, error);
  }
}

async function deleteDataOffline(table: string, id: string): Promise<void> {
  if (!db) {
    console.warn('Offline database not initialized.');
    return;
  }
  try {
    const tx = db.transaction(table, 'readwrite');
    const store = tx.objectStore(table);
    await store.delete(id);
    await tx.done;
    console.log(`Deleted data offline for table ${table} with id ${id}.`);
  } catch (error) {
    console.error(`Failed to delete data offline for table ${table} with id ${id}:`, error);
  }
}

export async function getOfflineData(table: string): Promise<any[]> {
  if (!db) {
    console.warn('Offline database not initialized.');
    return [];
  }
  try {
    const tx = db.transaction(table, 'readonly');
    const store = tx.objectStore(table);
    return await store.getAll();
  } catch (error) {
    console.error(`Failed to get offline data for table ${table}:`, error);
    return [];
  }
}
