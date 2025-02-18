import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";

export function useCompanyAPI() {
  const [companies, setCompanies] = useState<Company[]>([]);

  const fetchRiskLevel = async (cnae: string) => {
    // Simula a busca do nível de risco com base no CNAE
    // Em um cenário real, você faria uma chamada a uma API ou banco de dados
    // para obter essa informação.
    // Aqui, retornamos um valor fixo para demonstração.
    return "2";
  };

  const fetchCNPJData = async (cnpj: string) => {
    // Simula a busca de dados do CNPJ em uma API externa
    // Em um cenário real, você faria uma chamada a uma API como a da Receita Federal
    // para obter os dados da empresa.
    // Aqui, retornamos dados fictícios para demonstração.
    return {
      fantasyName: "",
      cnae: "",
      riskLevel: "",
      contactEmail: "",
      contactPhone: "",
      contactName: ""
    };
  };

  const checkExistingCNPJ = async (cnpj: string) => {
    const { data } = await supabase
      .from("companies")
      .select("id")
      .eq("cnpj", cnpj)
      .single();
    
    return Boolean(data);
  };

  // Load companies on mount
  const loadCompanies = async () => {
    const { data } = await supabase
      .from("companies")
      .select("*")
      .order("fantasy_name");
    
    if (data) {
      setCompanies(data);
    }
  };

  return {
    companies,
    fetchRiskLevel,
    fetchCNPJData,
    checkExistingCNPJ,
    loadCompanies
  };
}
