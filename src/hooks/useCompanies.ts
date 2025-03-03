
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Company, CompanyStatus } from "@/types/company";
import { isValidCNPJ, isValidPhone, isValidDate } from "@/utils/formatters";

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<'name' | 'cnpj'>('name');
  const { toast } = useToast();

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [searchTerm, searchType, companies]);

  const validateCompanyData = (company: Partial<Company>) => {
    const errors: string[] = [];

    if (company.cnpj && !isValidCNPJ(company.cnpj)) {
      errors.push("CNPJ inválido");
    }

    if (company.contact_phone && !isValidPhone(company.contact_phone)) {
      errors.push("Telefone inválido");
    }

    if (company.created_at && !isValidDate(company.created_at)) {
      errors.push("Data de cadastro inválida");
    }

    return errors;
  };

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      console.log("Fetching companies from Supabase...");
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Companies fetched successfully:", data);
      
      const companiesWithMetadata = (data || []).map(company => ({
        ...company,
        status: company.status as CompanyStatus,
        metadata: company.metadata ? company.metadata as Company['metadata'] : null
      }));

      // Validar dados antes de atualizar o estado
      companiesWithMetadata.forEach(company => {
        const errors = validateCompanyData(company);
        if (errors.length > 0) {
          console.warn(`Problemas encontrados na empresa ${company.fantasy_name}:`, errors);
        }
      });

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
    if (!searchTerm) {
      setFilteredCompanies(companies);
      return;
    }

    setSearching(true);
    const filtered = companies.filter(company => {
      if (searchType === 'name') {
        return company.fantasy_name?.toLowerCase().includes(searchTerm.toLowerCase());
      } else {
        return company.cnpj.includes(searchTerm.replace(/\D/g, ''));
      }
    });
    
    setFilteredCompanies(filtered);
    setSearching(false);
  };

  return {
    companies: filteredCompanies,
    loading,
    searching,
    searchTerm,
    searchType,
    setSearchTerm,
    setSearchType,
    refresh: fetchCompanies
  };
}
