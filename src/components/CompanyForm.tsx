
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Unit {
  address: string;
  geolocation: string;
  technicalResponsible: string;
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

      const { error: insertError } = await supabase
        .from('companies')
        .insert([{
          cnpj: cnpj.replace(/\D/g, ''),
          fantasy_name: fantasyName,
          employee_count: parseInt(employeeCount) || null,
          metadata: { units },
          user_id: userData.user.id
        }]);

      if (insertError) throw insertError;
      
      toast({
        title: "Empresa cadastrada com sucesso!",
        description: "Os dados foram validados e salvos no sistema.",
      });

      setCnpj("");
      setFantasyName("");
      setEmployeeCount("");
      setUnits([]);
      
      // Call the callback to refresh the companies list
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="cnpj">CNPJ da Empresa</Label>
        <Input
          id="cnpj"
          placeholder="00.000.000/0000-00"
          value={cnpj}
          onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Unidades</Label>
          <Button type="button" variant="outline" onClick={addUnit}>
            Adicionar Unidade
          </Button>
        </div>
        
        {units.map((unit, index) => (
          <div key={index} className="space-y-4 p-4 border rounded-lg">
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
        ))}
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Cadastrando..." : "Cadastrar Empresa"}
      </Button>
    </form>
  );
}
