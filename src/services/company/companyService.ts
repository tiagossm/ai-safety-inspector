
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

    return data || [];
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
      .select('fantasy_name, cnpj, cnae, address')
      .eq('id', companyId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data || null;
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

    return data || null;
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
    
    return data || [];
  } catch (error) {
    console.error("Error searching companies:", error);
    throw new Error(getErrorMessage(error));
  }
}
