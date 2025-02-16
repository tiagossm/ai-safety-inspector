
import { db, getPendingSyncs } from './database';
import { supabase } from '@/integrations/supabase/client';

export class SyncManager {
  private isSyncing = false;

  async trySync() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      // Sync empresas
      const pendingEmpresas = await getPendingSyncs('empresas');
      for (const empresa of pendingEmpresas) {
        const { error } = await supabase
          .from('companies')
          .upsert(empresa);

        if (!error) {
          const database = await db;
          const tx = database.transaction('empresas', 'readwrite');
          await tx.store.put({
            ...empresa,
            sync_status: 'synced'
          });
          await tx.done;
        }
      }

      // Sync inspections
      const pendingInspections = await getPendingSyncs('inspections');
      for (const inspection of pendingInspections) {
        const { error } = await supabase
          .from('inspections')
          .upsert(inspection);

        if (!error) {
          const database = await db;
          const tx = database.transaction('inspections', 'readwrite');
          await tx.store.put({
            ...inspection,
            sync_status: 'synced'
          });
          await tx.done;
        }
      }
    } finally {
      this.isSyncing = false;
    }
  }
}
