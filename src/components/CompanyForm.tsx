
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

interface Unit {
  address: string;
  geolocation: string;
  technicalResponsible: string;
  [key: string]: string;
}

interface CompanyFormProps {
  onCompanyCreated?: () => void;
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

  const fetchCNPJData = async (cnpj: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('validate-cnpj', {
        body: { cnpj: cnpj.replace(/\D/g, '') }
      });

      if (error) throw error;

      setFantasyName(data.fantasy_name || "");
      setCnae(data.cnae || "");
      setRiskLevel(data.risk_level || "");
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

      // Limpa o formulário
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

  // Handler para quando o CNPJ é alterado
  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCNPJ = formatCNPJ(e.target.value);
    setCnpj(formattedCNPJ);
    
    // Se o CNPJ estiver completo (14 dígitos), busca os dados
    if (e.target.value.replace(/\D/g, '').length === 14) {
      fetchCNPJData(formattedCNPJ);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ da Empresa</Label>
          <Input
            id="cnpj"
            placeholder="00.000.000/0000-00"
            value={cnpj}
            onChange={handleCNPJChange}
            maxLength={18}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fantasyName">Nome Fantasia</Label>
          <Input
            id="fantasyName"
            placeholder="Nome Fantasia da Empresa"
            value={fantasyName}
            onChange={(e) => setFantasyName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cnae">CNAE</Label>
          <Input
            id="cnae"
            placeholder="00.00-0-00"
            value={cnae}
            onChange={(e) => setCnae(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="riskLevel">Grau de Risco (NR 4)</Label>
          <Input
            id="riskLevel"
            value={riskLevel}
            readOnly
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="employeeCount">Quantidade de Funcionários</Label>
          <Input
            id="employeeCount"
            type="number"
            placeholder="Ex: 50"
            value={employeeCount}
            onChange={(e) => setEmployeeCount(e.target.value)}
            min="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactName">Nome do Contato</Label>
          <Input
            id="contactName"
            placeholder="Nome do contato"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactEmail">Email de Contato</Label>
          <Input
            id="contactEmail"
            type="email"
            placeholder="email@empresa.com"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactPhone">Telefone de Contato</Label>
          <Input
            id="contactPhone"
            placeholder="(00) 0000-0000"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Unidades</Label>
          <Button type="button" variant="outline" onClick={addUnit}>
            Adicionar Unidade
          </Button>
        </div>
        
        {units.map((unit, index) => (
          <div key={index} className="space-y-4 p-4 border rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Input
                  value={unit.address}
                  onChange={(e) => updateUnit(index, "address", e.target.value)}
                  placeholder="Endereço completo"
                />
              </div>
              <div className="space-y-2">
                <Label>Geolocalização</Label>
                <Input
                  value={unit.geolocation}
                  onChange={(e) => updateUnit(index, "geolocation", e.target.value)}
                  placeholder="Latitude, Longitude"
                />
              </div>
              <div className="space-y-2">
                <Label>Responsável Técnico</Label>
                <Input
                  value={unit.technicalResponsible}
                  onChange={(e) => updateUnit(index, "technicalResponsible", e.target.value)}
                  placeholder="Nome do responsável"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Cadastrando..." : "Cadastrar Empresa"}
        </Button>
      </div>
    </form>
  );
}
