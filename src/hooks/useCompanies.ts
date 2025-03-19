import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Company, CompanyStatus } from "@/types/company";
import { isValidCNPJ, isValidPhone, isValidDate } from "@/utils/formatters";

/**
 * useCompanies
 * Hook para gerenciar a listagem, busca e validação de empresas.
 * Ajuste as colunas do .select(...) de acordo com as que existem no seu banco.
 */
export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"name" | "cnpj">("name");
  const { toast } = useToast();

  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, searchType, companies]);

  /**
   * Validações pontuais de campos da empresa
   */
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

  /**
   * Busca as empresas no Supabase.
   * Ajuste o select(...) conforme as colunas existentes na tabela 'companies'.
   */
  const fetchCompanies = async () => {
    try {
      setLoading(true);

      // Se sua tabela NÃO tem fantasy_name, remova do select ou substitua por outra coluna real:
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, cnpj, status, contact_phone, created_at, metadata") 
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Mapeia as empresas para a tipagem que o front espera
      const companiesWithMetadata = (data || []).map((company) => ({
        ...company,
        // Força o cast para CompanyStatus, caso no BD esteja como string
        status: company.status as CompanyStatus,
        // Se metadata vier como objeto JSON, tipamos como Company['metadata']
        metadata: company.metadata ? (company.metadata as Company["metadata"]) : null,
      }));

      // Valida cada empresa e mostra warnings no console
      companiesWithMetadata.forEach((company) => {
        const errors = validateCompanyData(company);
        if (errors.length > 0) {
          console.warn(
            // Substituir por company.name, caso fantasy_name não exista:
            `Problemas encontrados na empresa ${company.name}:`,
            errors
          );
        }
      });

      setCompanies(companiesWithMetadata);
      setFilteredCompanies(companiesWithMetadata);
    } catch (error: any) {
      console.error("Error fetching companies:", error);
      toast({
        title: "Erro ao carregar empresas",
        description: "Não foi possível carregar a lista de empresas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filtra a lista de empresas pelo termo de busca e tipo de busca.
   * Substituímos 'fantasy_name' por 'name' (ou outra coluna que você tenha).
   */
  const filterCompanies = () => {
    if (!searchTerm) {
      setFilteredCompanies(companies);
      return;
    }

    setSearching(true);

    const filtered = companies.filter((company) => {
      if (searchType === "name") {
        // Se não existe 'fantasy_name', use 'name' ou outra coluna:
        return company.name?.toLowerCase().includes(searchTerm.toLowerCase());
      } else {
        // Busca por CNPJ
        return company.cnpj.includes(searchTerm.replace(/\D/g, ""));
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
    refresh: fetchCompanies,
  };
}
