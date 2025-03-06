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
    db = await openDB('offlineSync', 2, {  // Aumentamos a versão para 2
      upgrade(db) {
        console.log(`Upgrading IndexedDB to version 2`);

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
