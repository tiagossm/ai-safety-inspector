
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useCompanyAPI = () => {
  const { toast } = useToast();

  const fetchRiskLevel = async (cnae: string) => {
    try {
      // Format CNAE to standard format 0000-0/00
      const cleanCnae = cnae.replace(/[^\d]/g, '');
      if (cleanCnae.length !== 7) {
        throw new Error('CNAE deve ter 7 dígitos');
      }
      
      const formattedCnae = cleanCnae.replace(/(\d{4})(\d)(\d{2})/, '$1-$2/$3');
      console.log('Buscando grau de risco para CNAE:', formattedCnae); // Log para debug
      
      const { data, error } = await supabase
        .from('nr4_riscos')
        .select('grau_risco')
        .eq('cnae', formattedCnae)
        .maybeSingle();

      console.log('Resultado da busca:', { data, error }); // Log para debug

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
        description: error.message || "Verifique o formato do CNAE (0000-0/00)",
        variant: "destructive",
      });
      return "";
    }
  };

  const fetchCNPJData = async (cnpj: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('validate-cnpj', {
        body: { cnpj: cnpj.replace(/\D/g, '') }
      });

      if (error) throw error;

      // Buscar o grau de risco imediatamente após obter o CNAE
      let riskLevel = "";
      if (data.cnae) {
        riskLevel = await fetchRiskLevel(data.cnae);
      }

      toast({
        title: "Dados do CNPJ carregados",
        description: "Os dados da empresa foram preenchidos automaticamente.",
      });

      return {
        fantasyName: data.fantasy_name || "",
        cnae: data.cnae || "",
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
