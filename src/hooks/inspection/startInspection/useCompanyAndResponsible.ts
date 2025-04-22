
import { supabase } from "@/integrations/supabase/client";

export function useCompanyAndResponsible(updateFormField: (field: string, value: any) => void, formData: any) {
  const fetchCompanyDetails = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .single();
      if (error) throw error;
      if (data) {
        updateFormField("companyData", data);
        if (data.cnae && data.address && !formData.location) {
          updateFormField("location", data.address);
        }
      }
    } catch (err) {
      console.error("Error fetching company details:", err);
    }
  };

  const fetchResponsibleDetails = async (responsibleId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", responsibleId)
        .single();
      if (error) throw error;
      if (data) {
        updateFormField("responsibleData", data);
      }
    } catch (err) {
      console.error("Error fetching responsible details:", err);
    }
  };

  return { fetchCompanyDetails, fetchResponsibleDetails };
}
