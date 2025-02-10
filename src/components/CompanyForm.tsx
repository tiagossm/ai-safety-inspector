
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { BasicInfo } from "./company/BasicInfo";
import { ContactInfo } from "./company/ContactInfo";
import { UnitsList } from "./company/UnitsList";

interface Unit {
  address: string;
  geolocation: string;
  technicalResponsible: string;
  [key: string]: string;
}

interface CompanyFormProps {
  onCompanyCreated?: () => void;
}

interface NR4Risk {
  cnae: string;
  grau_risco: number;
}

export function CompanyForm({ onCompanyCreated }: CompanyFormProps) {
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

  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const fetchRiskLevel = async (cnae: string) => {
    try {
      const formattedCnae = cnae.replace(/[^\d]/g, '').replace(/(\d{4})(\d)(\d{2})/, '$1-$2/$3');
      const { data, error } = await supabase
        .from('nr4_riscos')
        .select('grau_risco')
        .eq('cnae', formattedCnae)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setRiskLevel(data.grau_risco.toString());
      } else {
        setRiskLevel("");
        toast({
          title: "CNAE não encontrado",
          description: "Não foi possível encontrar o grau de risco para este CNAE.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching risk level:', error);
      setRiskLevel("");
    }
  };

  const fetchCNPJData = async (cnpj: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('validate-cnpj', {
        body: { cnpj: cnpj.replace(/\D/g, '') }
      });

      if (error) throw error;

      setFantasyName(data.fantasy_name || "");
      setCnae(data.cnae || "");
      if (data.cnae) {
        fetchRiskLevel(data.cnae);
      }
      setContactEmail(data.contact_email || "");
      setContactPhone(data.contact_phone || "");
      setContactName(data.contact_name || "");

      toast({
        title: "Dados do CNPJ carregados",
        description: "Os dados da empresa foram preenchidos automaticamente.",
      });
    } catch (error) {
      console.error('Error fetching CNPJ data:', error);
      toast({
        title: "Erro ao buscar dados do CNPJ",
        description: error.message || "Verifique o CNPJ e tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleCNAEChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCnae = e.target.value;
    setCnae(newCnae);
    if (newCnae.length >= 7) { // Basic validation for CNAE format
      fetchRiskLevel(newCnae);
    }
  };

  const addUnit = () => {
    setUnits([...units, { address: "", geolocation: "", technicalResponsible: "" }]);
  };

  const updateUnit = (index: number, field: keyof Unit, value: string) => {
    const newUnits = [...units];
    newUnits[index][field] = value;
    setUnits(newUnits);
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

      // Reset form
      setCnpj("");
      setFantasyName("");
      setEmployeeCount("");
      setUnits([]);
      setCnae("");
      setRiskLevel("");
      setContactEmail("");
      setContactPhone("");
      setContactName("");
      
      if (onCompanyCreated) {
        onCompanyCreated();
      }
    } catch (error) {
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

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCNPJ = formatCNPJ(e.target.value);
    setCnpj(formattedCNPJ);
    
    if (e.target.value.replace(/\D/g, '').length === 14) {
      fetchCNPJData(formattedCNPJ);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <BasicInfo
        cnpj={cnpj}
        fantasyName={fantasyName}
        cnae={cnae}
        riskLevel={riskLevel}
        employeeCount={employeeCount}
        onCNPJChange={handleCNPJChange}
        onFantasyNameChange={(e) => setFantasyName(e.target.value)}
        onCNAEChange={handleCNAEChange}
        onEmployeeCountChange={(e) => setEmployeeCount(e.target.value)}
      />

      <ContactInfo
        contactName={contactName}
        contactEmail={contactEmail}
        contactPhone={contactPhone}
        onContactNameChange={(e) => setContactName(e.target.value)}
        onContactEmailChange={(e) => setContactEmail(e.target.value)}
        onContactPhoneChange={(e) => setContactPhone(e.target.value)}
      />

      <UnitsList
        units={units}
        onAddUnit={addUnit}
        onUpdateUnit={updateUnit}
      />

      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Cadastrando..." : "Cadastrar Empresa"}
        </Button>
      </div>
    </form>
  );
}
