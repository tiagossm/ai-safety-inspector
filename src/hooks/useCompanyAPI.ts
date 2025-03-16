import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CNPJResponse {
  fantasyName: string;
  cnae: string;
  riskLevel: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  contactName: string;
}

export const useCompanyAPI = () => {
  const { toast } = useToast();

  /**
   * Formata o CNAE para o padrão correto (XXXX-X).
   */
  const formatCNAE = (cnae: string): string => {
    if (!cnae) return '';
    
    // Remove todos os caracteres não numéricos
    const numbers = cnae.replace(/[^\d]/g, '');

    // Verifica se o CNAE tem exatamente 5 dígitos para aplicar o formato XXXX-X
    if (numbers.length === 5) {
      return `${numbers.slice(0, 4)}-${numbers.slice(4)}`; // Formato correto
    }

    // Caso o CNAE tenha apenas 4 dígitos, adiciona o "-0" no final
    if (numbers.length === 4) {
      return `${numbers}-0`; // Formato correto para CNAE com 4 dígitos
    }

    // Caso contrário, preenche o número com 4 dígitos e adiciona "-0"
    return `${numbers.padEnd(4, '0')}-0`; // Padroniza para XXXX-0 se for menor
  };

  /**
   * Busca o grau de risco no Supabase com base no CNAE.
   */
  const fetchRiskLevel = async (cnae: string) => {
    try {
      if (!cnae) throw new Error("CNAE é obrigatório");

      const formattedCnae = formatCNAE(cnae);
      console.log('Buscando grau de risco para CNAE:', formattedCnae);
      
      // Tenta buscar com várias formatações do CNAE para aumentar chances de encontrar
      const cnaeLookups = [
        formattedCnae,                  // XXXX-X (formato padrão)
        formattedCnae.replace('-', ''), // XXXXX (sem hífen)
        formattedCnae.slice(0, 4),      // XXXX (primeiros 4 dígitos)
        formattedCnae.slice(0, 2)       // XX (primeiros 2 dígitos - grupo econômico)
      ];
      
      // Tenta cada formato em sequência até encontrar
      for (const cnaeFormat of cnaeLookups) {
        if (!cnaeFormat) continue;
        
        console.log('Tentando buscar com CNAE:', cnaeFormat);
        
        const { data, error } = await supabase
          .from('nr4_riscos')
          .select('grau_risco')
          .eq('cnae', cnaeFormat)
          .maybeSingle();
        
        if (error) {
          console.error(`Erro ao consultar grau de risco para ${cnaeFormat}:`, error);
          continue;
        }
        
        if (data) {
          console.log(`Grau de risco encontrado para ${cnaeFormat}:`, data.grau_risco);
          return data.grau_risco.toString();
        }
      }
      
      // Se ainda não encontrou, tenta uma busca parcial
      console.log('Tentando busca parcial com like');
      const cnaeDigits = formattedCnae.replace(/\D/g, '');
      
      if (cnaeDigits.length >= 4) {
        const firstFourDigits = cnaeDigits.slice(0, 4);
        const { data, error } = await supabase
          .from('nr4_riscos')
          .select('grau_risco')
          .like('cnae', `${firstFourDigits}%`)
          .limit(1);
          
        if (error) {
          console.error('Erro ao fazer busca parcial:', error);
        } else if (data && data.length > 0) {
          console.log('Grau de risco encontrado com busca parcial:', data[0].grau_risco);
          return data[0].grau_risco.toString();
        }
      }

      console.log('CNAE não encontrado na tabela de riscos:', formattedCnae);
      
      toast({
        title: "CNAE não encontrado",
        description: `Não foi possível encontrar o grau de risco para o CNAE ${formattedCnae}`,
        variant: "destructive",
      });
      return "1"; // Default to level 1 risk if not found
    } catch (error: any) {
      console.error("❌ Erro ao buscar grau de risco:", error);
      toast({
        title: "Erro ao buscar grau de risco",
        description: error.message || "Verifique o formato do CNAE",
        variant: "destructive",
      });
      return "1"; // Default to level 1 risk if error
    }
  };

  /**
   * Busca os dados do CNPJ e inclui o grau de risco do CNAE associado.
   */
  const fetchCNPJData = async (cnpj: string): Promise<CNPJResponse | null> => {
    try {
      const cleanCNPJ = cnpj.replace(/\D/g, "");
      if (cleanCNPJ.length !== 14) {
        throw new Error("CNPJ deve ter 14 dígitos");
      }

      console.log("📌 Buscando dados do CNPJ:", cleanCNPJ);

      const { data: response, error } = await supabase.functions.invoke("validate-cnpj", {
        body: { cnpj: cleanCNPJ },
      });

      if (error) {
        console.error('Error calling validate-cnpj function:', error);
        throw error;
      }
      
      if (!response) {
        console.error('No response from validate-cnpj function');
        throw new Error('Sem resposta da API');
      }

      console.log("✅ Dados retornados da API:", response);

      // Result already has risk level from the edge function
      // But just as a fallback check if missing
      let riskLevel = response.riskLevel;
      
      if (!riskLevel && response.cnae) {
        console.log('Buscando grau de risco localmente como fallback');
        riskLevel = await fetchRiskLevel(response.cnae);
      }

      // Return data in expected format with risk level
      const result: CNPJResponse = {
        fantasyName: response.fantasyName || '',
        cnae: response.cnae || '',
        riskLevel: riskLevel || '1',
        address: response.address || '',
        contactEmail: response.contactEmail || '',
        contactPhone: response.contactPhone || '',
        contactName: response.contactName || ''
      };

      console.log("✅ Dados formatados para retorno:", result);

      toast({
        title: "Dados do CNPJ carregados",
        description: "Os dados foram preenchidos automaticamente.",
      });

      return result;
    } catch (error: any) {
      console.error("❌ Erro ao buscar dados do CNPJ:", error);
      toast({
        title: "Erro ao buscar dados do CNPJ",
        description: error.message || "Verifique o CNPJ e tente novamente",
        variant: "destructive",
      });
      return null;
    }
  };

  /**
   * Verifica se o CNPJ já está cadastrado no sistema.
   */
  const checkExistingCNPJ = async (cnpj: string) => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("cnpj")
        .eq("cnpj", cnpj.replace(/\D/g, ""))
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error("❌ Erro ao verificar CNPJ existente:", error);
      return false;
    }
  };

  return {
    fetchRiskLevel,
    fetchCNPJData,
    checkExistingCNPJ,
    formatCNAE
  };
};
