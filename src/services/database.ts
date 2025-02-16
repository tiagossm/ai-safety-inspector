
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface MyDB extends DBSchema {
  empresas: {
    key: string;
    value: {
      id: string;
      name: string;
      cnpj: string;
      sync_status: 'pending' | 'synced' | 'error';
      updated_at: string;
    };
    indexes: { 'by-sync-status': string };
  };
  inspections: {
    key: string;
    value: {
      id: string;
      company_id: string;
      status: string;
      sync_status: 'pending' | 'synced' | 'error';
      data: any;
      updated_at: string;
    };
    indexes: { 'by-sync-status': string };
  };
}

// Initialize the database
const dbPromise = openDB<MyDB>('offline-app-db', 1, {
  upgrade(db) {
    // Create stores
    const empresasStore = db.createObjectStore('empresas', {
      keyPath: 'id'
    });
    empresasStore.createIndex('by-sync-status', 'sync_status');

    const inspectionsStore = db.createObjectStore('inspections', {
      keyPath: 'id'
    });
    inspectionsStore.createIndex('by-sync-status', 'sync_status');
  },
});

export const db = dbPromise;

export async function saveOfflineData(storeName: 'empresas' | 'inspections', data: any) {
  const database = await db;
  const tx = database.transaction(storeName, 'readwrite');
  await tx.store.put({
    ...data,
    sync_status: 'pending',
    updated_at: new Date().toISOString()
  });
  await tx.done;
}

export async function getOfflineData(storeName: 'empresas' | 'inspections') {
  const database = await db;
  return database.getAll(storeName);
}

export async function getPendingSyncs(storeName: 'empresas' | 'inspections') {
  const database = await db;
  const index = database.transaction(storeName).store.index('by-sync-status');
  return index.getAll('pending');
}
