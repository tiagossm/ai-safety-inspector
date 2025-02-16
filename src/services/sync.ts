
import { db, getPendingSyncs } from './database';
import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/types/company';
import { Json } from '@/integrations/supabase/types';

interface LocalCompany {
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

interface LocalInspection {
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
}

export class SyncManager {
  private isSyncing = false;

  async trySync() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      // Sync empresas
      const pendingEmpresas = await getPendingSyncs('empresas');
      for (const empresa of pendingEmpresas) {
        const companyData = this.sanitizeCompanyData(empresa as LocalCompany);
        
        const { error } = await supabase
          .from('companies')
          .upsert(companyData);

        if (!error) {
          const database = await db;
          const tx = database.transaction('empresas', 'readwrite');
          const updatedEmpresa: LocalCompany = {
            ...(empresa as LocalCompany),
            sync_status: 'synced'
          };
          await tx.store.put(updatedEmpresa);
          await tx.done;
        }
      }

      // Sync inspections
      const pendingInspections = await getPendingSyncs('inspections');
      for (const inspection of pendingInspections) {
        const inspectionData = this.sanitizeInspectionData(inspection as LocalInspection);
        
        const { error } = await supabase
          .from('inspections')
          .upsert(inspectionData);

        if (!error) {
          const database = await db;
          const tx = database.transaction('inspections', 'readwrite');
          const updatedInspection: LocalInspection = {
            ...(inspection as LocalInspection),
            sync_status: 'synced'
          };
          await tx.store.put(updatedInspection);
          await tx.done;
        }
      }
    } finally {
      this.isSyncing = false;
    }
  }

  private sanitizeCompanyData(company: LocalCompany) {
    // Remove sync_status and other local-only fields before sending to Supabase
    const { sync_status, ...companyData } = company;
    return companyData;
  }

  private sanitizeInspectionData(inspection: LocalInspection) {
    // Remove sync_status and other local-only fields before sending to Supabase
    const { sync_status, ...inspectionData } = inspection;
    return inspectionData;
  }
}
