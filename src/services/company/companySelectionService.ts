
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Company } from "@/types/company";

export type CompanySearchResult = {
  id: string;
  name: string;
  fantasy_name: string;
  cnpj: string;
  cnae: string | null;
  address: string | null;
};

/**
 * Fetches active companies with optional search term
 */
export async function fetchCompanies(searchTerm?: string): Promise<CompanySearchResult[]> {
  try {
    const query = supabase
      .from("companies")
      .select("id, fantasy_name, cnpj, cnae, address")
      .eq("status", "active");
      
    // Apply search filter if provided
    if (searchTerm && searchTerm.trim() !== '') {
      query.ilike("fantasy_name", `%${searchTerm}%`);
    }
    
    const { data, error } = await query.order("fantasy_name", { ascending: true });

    if (error) throw error;

    return (data || []).map(company => ({
      id: company.id,
      name: company.fantasy_name || 'Empresa sem nome',
      fantasy_name: company.fantasy_name || 'Empresa sem nome',
      cnpj: company.cnpj || '',
      cnae: company.cnae,
      address: company.address
    }));
  } catch (error) {
    console.error("Error fetching companies:", error);
    return [];
  }
}

/**
 * Fetches a single company by ID
 */
export async function fetchCompanyById(id: string): Promise<CompanySearchResult | null> {
  if (!id) return null;
  
  try {
    const { data, error } = await supabase
      .from("companies")
      .select("id, fantasy_name, cnpj, cnae, address")
      .eq("id", id)
      .eq("status", "active")
      .maybeSingle();

    if (error) throw error;
    
    if (!data) return null;

    return {
      id: data.id,
      name: data.fantasy_name || 'Empresa sem nome',
      fantasy_name: data.fantasy_name || 'Empresa sem nome',
      cnpj: data.cnpj || '',
      cnae: data.cnae,
      address: data.address
    };
  } catch (error) {
    console.error("Error fetching company by ID:", error);
    return null;
  }
}

/**
 * Validates if a company ID exists and is active
 */
export async function validateCompanyId(id: string): Promise<{ valid: boolean, error?: string }> {
  if (!id) return { valid: false, error: "ID não fornecido" };
  
  // Check UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return { valid: false, error: "ID de empresa inválido" };
  }
  
  try {
    const company = await fetchCompanyById(id);
    
    if (!company) {
      return { valid: false, error: "Empresa não encontrada ou inativa" };
    }
    
    return { valid: true };
  } catch (error) {
    console.error("Error validating company ID:", error);
    return { valid: false, error: "Erro ao validar empresa" };
  }
}

/**
 * Create a new company with quick form
 */
export async function createCompany(companyData: {
  fantasy_name: string;
  cnpj: string;
  address?: string;
  cnae?: string;
}): Promise<CompanySearchResult | null> {
  try {
    const { data, error } = await supabase
      .from("companies")
      .insert([
        {
          fantasy_name: companyData.fantasy_name,
          cnpj: companyData.cnpj,
          address: companyData.address || null,
          cnae: companyData.cnae || null,
          status: "active"
        }
      ])
      .select("id, fantasy_name, cnpj, cnae, address")
      .single();

    if (error) throw error;
    
    toast.success("Empresa criada com sucesso");
    
    return {
      id: data.id,
      name: data.fantasy_name,
      fantasy_name: data.fantasy_name,
      cnpj: data.cnpj,
      cnae: data.cnae,
      address: data.address
    };
  } catch (error) {
    console.error("Error creating company:", error);
    toast.error("Erro ao criar empresa");
    return null;
  }
}
