
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CompanyListItem } from "@/types/CompanyListItem";

export function useChecklistCompanies() {
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState<boolean>(true);

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoadingCompanies(true);
        
        const { data, error } = await supabase
          .from('companies')
          .select('id, fantasy_name')
          .eq('status', 'active')
          .order('fantasy_name', { ascending: true });
          
        if (error) {
          console.error("Error fetching companies:", error);
          toast.error("Erro ao carregar empresas");
          throw error;
        }
        
        setCompanies(data || []);
      } catch (error) {
        console.error("Error in fetchCompanies:", error);
      } finally {
        setLoadingCompanies(false);
      }
    };
    
    fetchCompanies();
  }, []);

  return { companies, loadingCompanies };
}
