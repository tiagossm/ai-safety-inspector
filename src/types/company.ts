
import { Json } from "@/integrations/supabase/types";

export type CompanyMetadata = {
  units?: Array<{
    name?: string;
    address?: string;
    cnpj?: string;
    cnae?: string;
    fantasyName?: string;
    riskLevel?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactName?: string;
  }>;
}

export type Company = {
  id: string;
  fantasy_name: string | null;
  cnpj: string;
  cnae: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_name: string | null;
  employee_count: number | null;
  metadata: Json | null;
  created_at: string;
};
