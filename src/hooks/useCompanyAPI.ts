
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useCompanyAPI = () => {
  const { toast } = useToast();

  const formatCNAE = (cnae: string): string => {
    // Remove todos os caracteres não numéricos
    const numbers = cnae.replace(/[^\d]/g, '');
    
    // Verifica se tem pelo menos 5 dígitos
    if (numbers.length >= 5) {
      // Retorna no formato XXXX-X
      return `${numbers.slice(0, 4)}-${numbers.slice(4, 5)}`;
    }
    // Se não tiver 5 dígitos, preenche com zeros
    const paddedNumbers = numbers.padEnd(5, '0');
    return `${paddedNumbers.slice(0, 4)}-${paddedNumbers.slice(4, 5)}`;
  };

  const fetchRiskLevel = async (cnae: string) => {
    try {
      if (!cnae) {
        throw new Error('CNAE é obrigatório');
      }
      
      // Formata o CNAE antes de buscar
      const formattedCnae = formatCNAE(cnae);
      console.log('Buscando grau de risco para CNAE:', formattedCnae);
      
      const { data, error } = await supabase
        .from('nr4_riscos')
        .select('grau_risco')
        .eq('cnae', formattedCnae)
        .maybeSingle();

      console.log('Resultado da busca:', { data, error });

      if (error) throw error;
      
      if (data) {
        return data.grau_risco.toString();
      } else {
        toast({
          title: "CNAE não encontrado",
          description: `Não foi possível encontrar o grau de risco para o CNAE ${formattedCnae}`,
          variant: "destructive",
        });
        return "";
      }
    } catch (error: any) {
      console.error('Error fetching risk level:', error);
      toast({
        title: "Erro ao buscar grau de risco",
        description: error.message || "Verifique o formato do CNAE (XXXX-X)",
        variant: "destructive",
      });
      return "";
    }
  };

  const fetchCNPJData = async (cnpj: string) => {
    try {
      console.log('Buscando dados do CNPJ:', cnpj);
      const { data, error } = await supabase.functions.invoke('validate-cnpj', {
        body: { cnpj: cnpj.replace(/\D/g, '') }
      });

      if (error) throw error;

      console.log('Dados retornados:', data);

      // Formata o CNAE antes de buscar o grau de risco
      let riskLevel = "";
      if (data.cnae) {
        const formattedCnae = formatCNAE(data.cnae);
        riskLevel = await fetchRiskLevel(formattedCnae);
      }

      toast({
        title: "Dados do CNPJ carregados",
        description: "Os dados da empresa foram preenchidos automaticamente.",
      });

      return {
        fantasyName: data.fantasy_name || "",
        cnae: data.cnae ? formatCNAE(data.cnae) : "",
        riskLevel: riskLevel,
        contactEmail: data.contact_email || "",
        contactPhone: data.contact_phone || "",
        contactName: data.contact_name || "",
      };
    } catch (error: any) {
      console.error('Error fetching CNPJ data:', error);
      toast({
        title: "Erro ao buscar dados do CNPJ",
        description: error.message || "Verifique o CNPJ e tente novamente.",
        variant: "destructive",
      });
      return null;
    }
  };

  const checkExistingCNPJ = async (cnpj: string) => {
    const { data, error } = await supabase
      .from('companies')
      .select('cnpj')
      .eq('cnpj', cnpj.replace(/\D/g, ''))
      .eq('status', 'active')  // Verifica apenas empresas ativas
      .maybeSingle();
    
    if (error) {
      console.error('Error checking CNPJ:', error);
      return false;
    }
    
    return !!data;
  };

  return {
    fetchRiskLevel,
    fetchCNPJData,
    checkExistingCNPJ,
  };
};
