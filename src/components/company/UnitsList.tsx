
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCompanyAPI } from "@/hooks/useCompanyAPI";
import { Zap } from "lucide-react";

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

interface UnitsListProps {
  units: Unit[];
  onAddUnit: () => void;
  onUpdateUnit: (index: number, field: keyof Unit, value: string) => void;
}

export function UnitsList({ units, onAddUnit, onUpdateUnit }: UnitsListProps) {
  const { fetchCNPJData } = useCompanyAPI();

  const handleCNPJChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    onUpdateUnit(index, "cnpj", value);
    
    if (value.replace(/\D/g, '').length === 14) {
      const data = await fetchCNPJData(value);
      if (data) {
        onUpdateUnit(index, "fantasyName", data.fantasyName);
        onUpdateUnit(index, "cnae", data.cnae);
        onUpdateUnit(index, "riskLevel", data.riskLevel);
        onUpdateUnit(index, "contactEmail", data.contactEmail);
        onUpdateUnit(index, "contactPhone", data.contactPhone);
        onUpdateUnit(index, "contactName", data.contactName);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Unidades</Label>
        <Button type="button" variant="outline" onClick={onAddUnit}>
          Adicionar Unidade
        </Button>
      </div>
      
      {units.map((unit, index) => (
        <div key={index} className="space-y-4 p-4 border rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input
                value={unit.cnpj || ''}
                onChange={(e) => handleCNPJChange(e, index)}
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div className="space-y-2">
              <Label>Nome Fantasia</Label>
              <Input
                value={unit.fantasyName || ''}
                onChange={(e) => onUpdateUnit(index, "fantasyName", e.target.value)}
                placeholder="Nome Fantasia"
              />
            </div>
            <div className="space-y-2">
              <Label>CNAE</Label>
              <Input
                value={unit.cnae || ''}
                onChange={(e) => onUpdateUnit(index, "cnae", e.target.value)}
                placeholder="0000-0"
              />
            </div>
            <div className="space-y-2">
              <Label>Grau de Risco</Label>
              <Input
                value={unit.riskLevel || ''}
                readOnly
                placeholder="Grau de Risco"
              />
            </div>
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input
                value={unit.address}
                onChange={(e) => onUpdateUnit(index, "address", e.target.value)}
                placeholder="Endereço completo"
              />
            </div>
            <div className="space-y-2">
              <Label>Geolocalização</Label>
              <Input
                value={unit.geolocation}
                onChange={(e) => onUpdateUnit(index, "geolocation", e.target.value)}
                placeholder="Latitude, Longitude"
              />
            </div>
            <div className="space-y-2">
              <Label>Nome do Contato</Label>
              <Input
                value={unit.contactName || ''}
                onChange={(e) => onUpdateUnit(index, "contactName", e.target.value)}
                placeholder="Nome do contato"
              />
            </div>
            <div className="space-y-2">
              <Label>Email do Contato</Label>
              <Input
                value={unit.contactEmail || ''}
                onChange={(e) => onUpdateUnit(index, "contactEmail", e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone do Contato</Label>
              <Input
                value={unit.contactPhone || ''}
                onChange={(e) => onUpdateUnit(index, "contactPhone", e.target.value)}
                placeholder="(00) 0000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label>Responsável Técnico</Label>
              <Input
                value={unit.technicalResponsible}
                onChange={(e) => onUpdateUnit(index, "technicalResponsible", e.target.value)}
                placeholder="Nome do responsável"
              />
            </div>
          </div>
          <div className="pt-2">
            <Button variant="outline" className="w-full" size="sm">
              <Zap className="h-4 w-4 mr-2" />
              Dimensione NRs com IA
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
