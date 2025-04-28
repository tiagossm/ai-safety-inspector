
import { supabase } from "@/integrations/supabase/client";
import { getErrorMessage } from "@/utils/errors";

/**
 * Fetches list of companies
 */
export async function fetchCompanies() {
  try {
    const { data, error } = await supabase
      .from("companies")
      .select("id, fantasy_name, cnpj, cnae, address")
      .eq("status", "active")
      .order("fantasy_name", { ascending: true });

    if (error) {
      throw error;
    }

    // Map companies to ensure correct format
    const formattedCompanies = data?.map(company => ({
      id: company.id,
      name: company.fantasy_name || 'Empresa sem nome',
      fantasy_name: company.fantasy_name || 'Empresa sem nome',
      cnpj: company.cnpj || '',
      cnae: company.cnae || '',
      address: company.address || ''
    })) || [];

    return formattedCompanies;
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Fetches company name by ID
 */
export async function fetchCompanyNameById(companyId: string) {
  if (!companyId) {
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('id, fantasy_name, cnpj, cnae, address')
      .eq('id', companyId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) return null;
    
    return {
      id: data.id,
      name: data.fantasy_name || 'Empresa sem nome',
      fantasy_name: data.fantasy_name || 'Empresa sem nome',
      cnpj: data.cnpj || '',
      cnae: data.cnae || '',
      address: data.address || ''
    };
  } catch (error) {
    console.error("Error fetching company name:", error);
    return null;
  }
}

/**
 * Fetches full company details by ID
 */
export async function fetchCompanyById(companyId: string) {
  if (!companyId) {
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) return null;
    
    return {
      ...data,
      name: data.fantasy_name || 'Empresa sem nome'
    };
  } catch (error) {
    console.error("Error fetching company details:", error);
    return null;
  }
}

/**
 * Searches companies by name
 */
export async function searchCompaniesByName(query: string) {
  if (!query || query.trim() === '') {
    return await fetchCompanies();
  }
  
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('id, fantasy_name, cnpj, cnae, address')
      .eq('status', 'active')
      .ilike('fantasy_name', `%${query}%`)
      .order('fantasy_name', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    // Map companies to ensure correct format
    const formattedCompanies = data?.map(company => ({
      id: company.id,
      name: company.fantasy_name || 'Empresa sem nome',
      fantasy_name: company.fantasy_name || 'Empresa sem nome',
      cnpj: company.cnpj || '',
      cnae: company.cnae || '',
      address: company.address || ''
    })) || [];
    
    return formattedCompanies;
  } catch (error) {
    console.error("Error searching companies:", error);
    throw new Error(getErrorMessage(error));
  }
}
