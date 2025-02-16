
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Company } from '@/types/company';
import { Json } from '@/integrations/supabase/types';

interface MyDB extends DBSchema {
  empresas: {
    key: string;
    value: {
      id: string;
      fantasy_name: string | null;
      cnpj: string;
      cnae: string | null;
      contact_email: string | null;
      contact_phone: string | null;
      contact_name: string | null;
      employee_count: number | null;
      metadata: Json | null;
      status: string;
      sync_status: 'pending' | 'synced' | 'error';
      user_id: string;
      updated_at: string;
    };
    indexes: { 'by-sync-status': string };
  };
  inspections: {
    key: string;
    value: {
      id: string;
      cnae: string;
      checklist: Json | null;
      risks: Json | null;
      photos: string[] | null;
      audio_url: string | null;
      report_url: string | null;
      status: string;
      sync_status: 'pending' | 'synced' | 'error';
      user_id: string;
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
