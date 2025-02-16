
import { db, getPendingSyncs } from './database';
import { supabase } from '@/integrations/supabase/client';
import { Company, CompanyMetadata } from '@/types/company';
import { Json } from '@/integrations/supabase/types';
import { User } from '@supabase/supabase-js';

interface LocalCompanyBase {
  id: string;
  fantasy_name: string | null;
  cnpj: string;
  cnae: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_name: string | null;
  employee_count: number | null;
  metadata: CompanyMetadata | null;
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

type DatabaseCompany = LocalCompanyBase;
type DatabaseInspection = LocalInspectionBase;

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
      const pendingEmpresas = await getPendingSyncs('empresas') as DatabaseCompany[];
      for (const empresa of pendingEmpresas) {
        const { sync_status, ...companyData } = empresa;
        
        const { error } = await supabase
          .from('companies')
          .upsert({
            ...companyData,
            metadata: companyData.metadata || {},
            user_id: this.user.id
          });

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

      const pendingInspections = await getPendingSyncs('inspections') as DatabaseInspection[];
      for (const inspection of pendingInspections) {
        const { sync_status, ...inspectionData } = inspection;
        
        const { error } = await supabase
          .from('inspections')
          .upsert({
            ...inspectionData,
            user_id: this.user.id
          });

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
