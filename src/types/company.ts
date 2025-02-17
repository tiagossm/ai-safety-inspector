
export type CompanyStatus = 'active' | 'inactive' | 'archived';

export type CompanyUnit = {
  id: string;
  fantasy_name: string | null;
  code?: string;
  address?: string | null;
  cnpj: string;
  cnae?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  contact_name?: string | null;
};

export type CompanyMetadata = {
  units?: CompanyUnit[];
  risk_grade?: string;
  [key: string]: any;
};

export type Contact = {
  id: string;
  company_id: string;
  name: string;
  role: string;
  emails: string[];
  phones: string[];
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
  deactivated_at?: string | null;
};

export type UnitType = 'matriz' | 'filial';

export type Unit = {
  id: string;
  company_id: string;
  fantasy_name: string | null;
  cnpj: string;
  cnae: string | null;
  address: string | null;
  unit_type: UnitType;
  geolocation: string | null;
  technical_responsible: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  parent_unit_id: string | null;
  created_at: string;
  updated_at: string;
};
