
import { useState } from "react";
import { useCompanyAPI } from "@/hooks/useCompanyAPI";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatCNPJ } from "@/utils/formatters";

export function useCompanyForm(onCompanyCreated?: () => void) {
  const [cnpj, setCnpj] = useState("");
  const [fantasyName, setFantasyName] = useState("");
  const [cnae, setCnae] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [address, setAddress] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactName, setContactName] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { fetchCNPJData } = useCompanyAPI();
  const { toast } = useToast();

  const resetForm = () => {
    setCnpj("");
    setFantasyName("");
    setCnae("");
    setRiskLevel("");
    setAddress("");
    setContactEmail("");
    setContactPhone("");
    setContactName("");
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCNPJ = formatCNPJ(e.target.value);
    setCnpj(formattedCNPJ);
  };

  const handleCNPJBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.replace(/\D/g, '').length === 14) {
      setLoading(true);
      try {
        const response = await fetchCNPJData(value);
        if (response) {
          setFantasyName(response.fantasyName);
          setCnae(response.cnae);
          setRiskLevel(response.riskLevel);
          setAddress(response.address || '');
          setContactEmail(response.contactEmail || '');
          setContactPhone(response.contactPhone || '');
          setContactName(response.contactName || '');
          
          // Log para debug do endereço
          console.log('Endereço recebido:', response.address);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do CNPJ:', error);
        toast({
          title: "Erro ao buscar dados",
          description: "Não foi possível consultar os dados do CNPJ",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const getRiskLevelVariant = (level: string) => {
    const riskNumber = parseInt(level);
    if (riskNumber <= 2) return "success";
    if (riskNumber === 3) return "warning";
    return "destructive";
  };

  const handleSubmit = async (e: React.FormEvent, userId: string) => {
    e.preventDefault();
    if (!cnpj || !fantasyName) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('companies').insert({
        cnpj: cnpj.replace(/\D/g, ''),
        fantasy_name: fantasyName,
        cnae,
        address, // Garantindo que o endereço seja incluído
        contact_email: contactEmail,
        contact_phone: contactPhone,
        contact_name: contactName,
        status: 'active',
        user_id: userId,
        metadata: {
          risk_grade: riskLevel
        }
      });

      if (error) throw error;

      toast({
        title: "Empresa cadastrada com sucesso!",
        description: "A empresa foi adicionada ao sistema.",
      });

      resetForm();
      onCompanyCreated?.();
    } catch (error: any) {
      console.error('Erro ao cadastrar empresa:', error);
      toast({
        title: "Erro ao cadastrar empresa",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formState: {
      cnpj,
      fantasyName,
      cnae,
      riskLevel,
      address,
      contactEmail,
      contactPhone,
      contactName,
      loading
    },
    handlers: {
      handleCNPJChange,
      handleCNPJBlur,
      handleSubmit
    },
    getRiskLevelVariant
  };
}
