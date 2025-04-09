
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches list of companies
 */
export async function fetchCompanies() {
  const { data, error } = await supabase
    .from("companies")
    .select("id, fantasy_name")
    .eq("status", "active")
    .order("fantasy_name", { ascending: true });

  if (error) {
    console.error("Error fetching companies:", error);
    throw error;
  }

  return data;
}

/**
 * Fetches company name by ID
 */
export async function fetchCompanyNameById(companyId: string) {
  const { data, error } = await supabase
    .from('companies')
    .select('fantasy_name')
    .eq('id', companyId)
    .single();

  if (error) {
    console.error("Error fetching company name:", error);
    throw error;
  }

  return data?.fantasy_name || null;
}
