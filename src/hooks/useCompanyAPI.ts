
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

  const formatCNAE = (cnae: string): string => {
    if (!cnae) return '';
    
    // Remove all non-numeric characters
    const numbers = cnae.replace(/[^\d]/g, '');
    
    // Format as XXXX-X if possible
    if (numbers.length >= 5) {
      return `${numbers.slice(0, 4)}-${numbers.slice(4, 5)}`;
    } else {
      // If less than 5 digits, pad with zeros
      return `${numbers.padEnd(4, '0')}-0`;
    }
  };

  const fetchRiskLevel = async (cnae: string) => {
    try {
      if (!cnae) throw new Error('CNAE é obrigatório');
      
      const formattedCnae = formatCNAE(cnae);
      console.log('Buscando grau de risco para CNAE:', formattedCnae);
      
      // Make sure to use the correct table and query
      const { data, error } = await supabase
        .from('nr4_riscos')
        .select('grau_risco')
        .eq('cnae', formattedCnae)
        .maybeSingle();

      if (error) {
        console.error('Error fetching risk level:', error);
        throw error;
      }
      
      if (data) {
        console.log('Grau de risco encontrado:', data.grau_risco);
        return data.grau_risco.toString();
      }
      
      console.log('CNAE não encontrado na tabela de riscos:', formattedCnae);
      console.log('Tentando buscar sem o hífen...');
      
      // If not found with hyphen, try without hyphen
      const cleanCNAE = formattedCnae.replace('-', '');
      const { data: dataWithoutHyphen, error: errorWithoutHyphen } = await supabase
        .from('nr4_riscos')
        .select('grau_risco')
        .eq('cnae', cleanCNAE)
        .maybeSingle();
        
      if (errorWithoutHyphen) {
        console.error('Error fetching risk level without hyphen:', errorWithoutHyphen);
      }
      
      if (dataWithoutHyphen) {
        console.log('Grau de risco encontrado (sem hífen):', dataWithoutHyphen.grau_risco);
        return dataWithoutHyphen.grau_risco.toString();
      }
      
      toast({
        title: "CNAE não encontrado",
        description: `Não foi possível encontrar o grau de risco para o CNAE ${formattedCnae}`,
        variant: "destructive",
      });
      return "1"; // Default to level 1 risk if not found
    } catch (error: any) {
      console.error('Error fetching risk level:', error);
      toast({
        title: "Erro ao buscar grau de risco",
        description: error.message || "Verifique o formato do CNAE",
        variant: "destructive",
      });
      return "1"; // Default to level 1 risk if error
    }
  };

  const fetchCNPJData = async (cnpj: string): Promise<CNPJResponse | null> => {
    try {
      const cleanCNPJ = cnpj.replace(/\D/g, '');
      if (cleanCNPJ.length !== 14) {
        throw new Error('CNPJ deve ter 14 dígitos');
      }

      console.log('Buscando dados do CNPJ:', cleanCNPJ);

      const { data: response, error } = await supabase.functions.invoke('validate-cnpj', {
        body: { cnpj: cleanCNPJ }
      });

      if (error) {
        console.error('Error calling validate-cnpj function:', error);
        throw error;
      }
      
      if (!response) {
        console.error('No response from validate-cnpj function');
        throw new Error('Sem resposta da API');
      }

      console.log('Dados retornados da API:', response);

      // Make sure CNAE is formatted correctly before fetching risk level
      const formattedCnae = response.cnae ? formatCNAE(response.cnae) : '';
      let riskLevel = '';
      
      if (formattedCnae) {
        riskLevel = await fetchRiskLevel(formattedCnae);
        console.log('Grau de risco obtido:', riskLevel);
      } else {
        // Default to level 1 if no CNAE provided
        riskLevel = "1";
      }

      // Return data in expected format
      const result: CNPJResponse = {
        fantasyName: response.fantasyName || '',
        cnae: formattedCnae,
        riskLevel,
        address: response.address || '',
        contactEmail: response.contactEmail || '',
        contactPhone: response.contactPhone || '',
        contactName: response.contactName || ''
      };

      console.log('Dados formatados para retorno:', result);

      toast({
        title: "Dados do CNPJ carregados",
        description: "Os dados foram preenchidos automaticamente.",
      });

      return result;
    } catch (error: any) {
      console.error('Error fetching CNPJ data:', error);
      toast({
        title: "Erro ao buscar dados do CNPJ",
        description: error.message || "Verifique o CNPJ e tente novamente",
        variant: "destructive",
      });
      return null;
    }
  };

  const checkExistingCNPJ = async (cnpj: string) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('cnpj')
        .eq('cnpj', cnpj.replace(/\D/g, ''))
        .eq('status', 'active')
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking CNPJ:', error);
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
