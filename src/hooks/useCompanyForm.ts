import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { useCompanyAPI } from "./useCompanyAPI";

interface Unit {
  address: string;
  geolocation: string;
  technicalResponsible: string;
  cnpj?: string;
  fantasyName?: string;
  cnae?: string;
  riskLevel?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactName?: string;
  [key: string]: string | undefined;
}

export const useCompanyForm = (onCompanyCreated?: () => void) => {
  const [cnpj, setCnpj] = useState("");
  const [fantasyName, setFantasyName] = useState("");
  const [employeeCount, setEmployeeCount] = useState<string>("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [cnae, setCnae] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactName, setContactName] = useState("");
  
  const { toast } = useToast();
  const { fetchRiskLevel, fetchCNPJData, checkExistingCNPJ } = useCompanyAPI();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const exists = await checkExistingCNPJ(cnpj);
      if (exists) {
        toast({
          title: "CNPJ já cadastrado",
          description: "Uma empresa com este CNPJ já existe no sistema.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const companyData = {
        cnpj: cnpj.replace(/\D/g, ''),
        fantasy_name: fantasyName,
        cnae,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        contact_name: contactName,
        employee_count: parseInt(employeeCount) || null,
        metadata: { 
          units,
          risk_level: riskLevel 
        } as Json,
        user_id: userData.user.id
      };

      const { error: insertError } = await supabase
        .from('companies')
        .insert(companyData);

      if (insertError) throw insertError;
      
      toast({
        title: "Empresa cadastrada com sucesso!",
        description: "Os dados foram validados e salvos no sistema.",
      });

      resetForm();
      
      if (onCompanyCreated) {
        onCompanyCreated();
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Erro ao cadastrar empresa",
        description: error.message || "Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCnpj("");
    setFantasyName("");
    setEmployeeCount("");
    setUnits([]);
    setCnae("");
    setRiskLevel("");
    setContactEmail("");
    setContactPhone("");
    setContactName("");
  };

  const handleCNPJChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCnpj(value);
    
    if (value.replace(/\D/g, '').length === 14) {
      const data = await fetchCNPJData(value);
      if (data) {
        setFantasyName(data.fantasyName);
        setCnae(data.cnae);
        if (data.cnae) {
          const riskLevel = await fetchRiskLevel(data.cnae);
          setRiskLevel(riskLevel);
        }
        setContactEmail(data.contactEmail);
        setContactPhone(data.contactPhone);
        setContactName(data.contactName);
      }
    }
  };

  const handleCNAEChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCnae = e.target.value;
    setCnae(newCnae);
    if (newCnae.length >= 7) {
      const riskLevel = await fetchRiskLevel(newCnae);
      setRiskLevel(riskLevel);
    }
  };

  const addUnit = () => {
    setUnits([...units, {
      address: "",
      geolocation: "",
      technicalResponsible: "",
      cnpj: "",
      fantasyName: "",
      cnae: "",
      riskLevel: "",
      contactEmail: "",
      contactPhone: "",
      contactName: "",
    }]);
  };

  const updateUnit = (index: number, field: keyof Unit, value: string) => {
    const newUnits = [...units];
    newUnits[index][field] = value;
    setUnits(newUnits);
  };

  return {
    formState: {
      cnpj,
      fantasyName,
      employeeCount,
      units,
      loading,
      cnae,
      riskLevel,
      contactEmail,
      contactPhone,
      contactName,
    },
    formHandlers: {
      handleSubmit,
      handleCNPJChange,
      handleCNAEChange,
      setFantasyName,
      setEmployeeCount,
      addUnit,
      updateUnit,
      setContactName,
      setContactEmail,
      setContactPhone,
    },
  };
};
