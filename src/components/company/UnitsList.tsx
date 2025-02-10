
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Unit {
  address: string;
  geolocation: string;
  technicalResponsible: string;
  [key: string]: string;
}

interface UnitsListProps {
  units: Unit[];
  onAddUnit: () => void;
  onUpdateUnit: (index: number, field: keyof Unit, value: string) => void;
}

export function UnitsList({ units, onAddUnit, onUpdateUnit }: UnitsListProps) {
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
              <Label>Responsável Técnico</Label>
              <Input
                value={unit.technicalResponsible}
                onChange={(e) => onUpdateUnit(index, "technicalResponsible", e.target.value)}
                placeholder="Nome do responsável"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
