
import { Json } from "@/integrations/supabase/types";

export type CompanyStatus = 'active' | 'inactive';

export type CompanyUnit = {
  id: string;
  name: string;
  code: string;
};

export type CompanyMetadata = {
  units: CompanyUnit[];
  risk_grade?: string;
  [key: string]: any;
};

export type Contact = {
  id: string;
  company_id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Company = {
  id: string;
  fantasy_name: string | null;
  cnpj: string;
  cnae: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_name: string | null;
  employee_count: number | null;
  metadata: CompanyMetadata | null;
  created_at: string;
  status: CompanyStatus;
};
