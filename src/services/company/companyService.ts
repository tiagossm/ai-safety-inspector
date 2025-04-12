
import { supabase } from "@/integrations/supabase/client";
import { getErrorMessage } from "@/utils/errors";

/**
 * Fetches list of companies
 */
export async function fetchCompanies() {
  try {
    const { data, error } = await supabase
      .from("companies")
      .select("id, fantasy_name")
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
      .select('fantasy_name')
      .eq('id', companyId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data?.fantasy_name || null;
  } catch (error) {
    console.error("Error fetching company name:", error);
    return null;
  }
}
