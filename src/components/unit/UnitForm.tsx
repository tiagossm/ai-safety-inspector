
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCompanyAPI } from "@/hooks/useCompanyAPI";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Unit {
  address: string;
  geolocation: string;
  technical_responsible: string;
  cnpj: string;
  fantasy_name: string;
  cnae: string;
  risk_grade: string;
  contact_email: string;
  contact_phone: string;
  contact_name: string;
  unit_type: 'matriz' | 'filial';
}

interface UnitFormProps {
  onSubmit: (unit: Unit) => void;
  initialData?: Partial<Unit>;
}

export function UnitForm({ onSubmit, initialData }: UnitFormProps) {
  const [unit, setUnit] = useState<Unit>({
    address: initialData?.address || '',
    geolocation: initialData?.geolocation || '',
    technical_responsible: initialData?.technical_responsible || '',
    cnpj: initialData?.cnpj || '',
    fantasy_name: initialData?.fantasy_name || '',
    cnae: initialData?.cnae || '',
    risk_grade: initialData?.risk_grade || '',
    contact_email: initialData?.contact_email || '',
    contact_phone: initialData?.contact_phone || '',
    contact_name: initialData?.contact_name || '',
    unit_type: initialData?.unit_type || 'filial',
  });

  const { fetchCNPJData, fetchRiskLevel } = useCompanyAPI();
  const { toast } = useToast();

  const handleChange = (field: keyof Unit, value: string) => {
    setUnit(prev => ({ ...prev, [field]: value }));
  };

  const handleCNPJChange = async (value: string) => {
    handleChange('cnpj', value);
    
    if (value.replace(/\D/g, '').length === 14) {
      const data = await fetchCNPJData(value);
      if (data) {
        handleChange('fantasy_name', data.fantasyName);
        handleChange('cnae', data.cnae);
        if (data.cnae) {
          const riskLevel = await fetchRiskLevel(data.cnae);
          handleChange('risk_grade', riskLevel);
        }
        handleChange('contact_email', data.contactEmail);
        handleChange('contact_phone', data.contactPhone);
        handleChange('contact_name', data.contactName);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unit.cnpj || !unit.fantasy_name) {
      toast({
        title: "Erro no formulário",
        description: "CNPJ e Nome Fantasia são obrigatórios",
        variant: "destructive",
      });
      return;
    }
    onSubmit(unit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>CNPJ</Label>
          <Input
            value={unit.cnpj}
            onChange={(e) => handleCNPJChange(e.target.value)}
            placeholder="00.000.000/0000-00"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Nome Fantasia</Label>
          <Input
            value={unit.fantasy_name}
            onChange={(e) => handleChange('fantasy_name', e.target.value)}
            placeholder="Nome Fantasia"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>CNAE</Label>
          <Input
            value={unit.cnae}
            onChange={(e) => handleChange('cnae', e.target.value)}
            placeholder="0000-0"
          />
        </div>
        <div className="space-y-2">
          <Label>Grau de Risco</Label>
          <Input
            value={unit.risk_grade}
            readOnly
            placeholder="Grau de Risco"
          />
        </div>
        <div className="space-y-2">
          <Label>Endereço</Label>
          <Input
            value={unit.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Endereço completo"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Geolocalização</Label>
          <Input
            value={unit.geolocation}
            onChange={(e) => handleChange('geolocation', e.target.value)}
            placeholder="Latitude, Longitude"
          />
        </div>
        <div className="space-y-2">
          <Label>Nome do Contato</Label>
          <Input
            value={unit.contact_name}
            onChange={(e) => handleChange('contact_name', e.target.value)}
            placeholder="Nome do contato"
          />
        </div>
        <div className="space-y-2">
          <Label>Email do Contato</Label>
          <Input
            value={unit.contact_email}
            onChange={(e) => handleChange('contact_email', e.target.value)}
            placeholder="email@exemplo.com"
            type="email"
          />
        </div>
        <div className="space-y-2">
          <Label>Telefone do Contato</Label>
          <Input
            value={unit.contact_phone}
            onChange={(e) => handleChange('contact_phone', e.target.value)}
            placeholder="(00) 0000-0000"
          />
        </div>
        <div className="space-y-2">
          <Label>Responsável Técnico</Label>
          <Input
            value={unit.technical_responsible}
            onChange={(e) => handleChange('technical_responsible', e.target.value)}
            placeholder="Nome do responsável"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="submit">Salvar Unidade</Button>
      </div>
    </form>
  );
}
