
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Company, CompanyStatus } from "@/types/company";

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [searchTerm, companies]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const companiesWithMetadata = (data || []).map(company => ({
        ...company,
        status: company.status as CompanyStatus,
        metadata: company.metadata ? company.metadata as Company['metadata'] : null
      })) satisfies Company[];

      setCompanies(companiesWithMetadata);
      setFilteredCompanies(companiesWithMetadata);
    } catch (error: any) {
      console.error('Error fetching companies:', error);
      toast({
        title: "Erro ao carregar empresas",
        description: "Não foi possível carregar a lista de empresas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCompanies = () => {
    setSearching(true);
    const filtered = companies.filter(company => 
      company.fantasy_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.cnpj.includes(searchTerm)
    );
    setFilteredCompanies(filtered);
    setSearching(false);
  };

  return {
    companies: filteredCompanies,
    loading,
    searching,
    searchTerm,
    setSearchTerm,
    refresh: fetchCompanies
  };
}
