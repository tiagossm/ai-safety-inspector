
import { db, getPendingSyncs } from './database';
import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/types/company';
import { Json } from '@/integrations/supabase/types';
import { User } from '@supabase/supabase-js';

// Define interfaces that match both the local DB and Supabase schema
interface LocalCompanyBase {
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
}

interface LocalInspectionBase {
  id: string;
  company_id: string;
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
}

interface DatabaseCompany extends LocalCompanyBase {}
interface DatabaseInspection extends LocalInspectionBase {}

export class SyncManager {
  private isSyncing = false;
  private user: User | null;

  constructor(user: User | null) {
    this.user = user;
  }

  async trySync() {
    if (this.isSyncing || !this.user) return;
    this.isSyncing = true;

    try {
      // Sync empresas
      const pendingEmpresas = (await getPendingSyncs('empresas')) as DatabaseCompany[];
      for (const empresa of pendingEmpresas) {
        const { sync_status, ...companyData } = {
          ...empresa,
          user_id: this.user.id
        };
        
        const { error } = await supabase
          .from('companies')
          .upsert(companyData);

        if (!error) {
          const database = await db;
          const tx = database.transaction('empresas', 'readwrite');
          await tx.store.put({
            ...empresa,
            sync_status: 'synced'
          } as DatabaseCompany);
          await tx.done;
        }
      }

      // Sync inspections
      const pendingInspections = (await getPendingSyncs('inspections')) as DatabaseInspection[];
      for (const inspection of pendingInspections) {
        const { sync_status, ...inspectionData } = {
          ...inspection,
          user_id: this.user.id
        };
        
        const { error } = await supabase
          .from('inspections')
          .upsert(inspectionData);

        if (!error) {
          const database = await db;
          const tx = database.transaction('inspections', 'readwrite');
          await tx.store.put({
            ...inspection,
            sync_status: 'synced'
          } as DatabaseInspection);
          await tx.done;
        }
      }
    } finally {
      this.isSyncing = false;
    }
  }
}
