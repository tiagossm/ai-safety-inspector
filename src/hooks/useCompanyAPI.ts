
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Company, CompanyMetadata } from "@/types/company";

export function useCompanyAPI() {
  const [companies, setCompanies] = useState<Company[]>([]);

  const fetchRiskLevel = async (cnae: string) => {
    return "2";
  };

  const fetchCNPJData = async (cnpj: string) => {
    return {
      fantasyName: "",
      cnae: "",
      riskLevel: "",
      contactEmail: "",
      contactPhone: "",
      contactName: ""
    };
  };

  const checkExistingCNPJ = async (cnpj: string) => {
    const { data } = await supabase
      .from("companies")
      .select("id")
      .eq("cnpj", cnpj)
      .single();
    
    return Boolean(data);
  };

  const loadCompanies = async () => {
    const { data } = await supabase
      .from("companies")
      .select("*")
      .order("fantasy_name");
    
    if (data) {
      // Transform the data to match the Company type
      const transformedData: Company[] = data.map(item => ({
        id: item.id,
        fantasy_name: item.fantasy_name,
        cnpj: item.cnpj,
        cnae: item.cnae,
        contact_email: item.contact_email,
        contact_phone: item.contact_phone,
        contact_name: item.contact_name,
        employee_count: item.employee_count,
        metadata: item.metadata as CompanyMetadata | null,
        created_at: item.created_at,
        status: item.status as Company['status'],
        deactivated_at: item.deactivated_at
      }));
      
      setCompanies(transformedData);
    }
  };

  return {
    companies,
    fetchRiskLevel,
    fetchCNPJData,
    checkExistingCNPJ,
    loadCompanies
  };
}
