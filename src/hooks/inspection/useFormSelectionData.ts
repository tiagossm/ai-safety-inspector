
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Hook for fetching companies and responsibles (users) data for forms
 */
export function useFormSelectionData() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [responsibles, setResponsibles] = useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingResponsibles, setLoadingResponsibles] = useState(false);
  const [errorCompanies, setErrorCompanies] = useState<string | null>(null);
  const [errorResponsibles, setErrorResponsibles] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies();
    fetchResponsibles();
  }, []);

  const fetchCompanies = async () => {
    setLoadingCompanies(true);
    setErrorCompanies(null);
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("id, fantasy_name, cnpj, cnae, address")
        .eq("status", "active")
        .order("fantasy_name", { ascending: true });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error: any) {
      console.error("Error fetching companies:", error);
      setErrorCompanies(error.message || "Erro ao carregar empresas");
      toast.error("Erro ao carregar empresas");
    } finally {
      setLoadingCompanies(false);
    }
  };

  const fetchResponsibles = async () => {
    setLoadingResponsibles(true);
    setErrorResponsibles(null);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, position")
        .order("name", { ascending: true });

      if (error) throw error;
      setResponsibles(data || []);
    } catch (error: any) {
      console.error("Error fetching responsibles:", error);
      setErrorResponsibles(error.message || "Erro ao carregar responsáveis");
      toast.error("Erro ao carregar responsáveis");
    } finally {
      setLoadingResponsibles(false);
    }
  };

  return {
    companies,
    responsibles,
    loadingCompanies,
    loadingResponsibles,
    errorCompanies,
    errorResponsibles,
    refreshCompanies: fetchCompanies,
    refreshResponsibles: fetchResponsibles
  };
}
