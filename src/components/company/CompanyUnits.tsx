
import { Company, CompanyUnit } from "@/types/company";
import { Button } from "@/components/ui/button";
import { BuildingIcon } from "lucide-react";

interface CompanyUnitsProps {
  company: Company;
  onAddUnit: () => void;
}

export function CompanyUnits({ company, onAddUnit }: CompanyUnitsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Unidades</h3>
        <Button variant="outline" size="sm" onClick={onAddUnit}>
          <BuildingIcon className="h-4 w-4 mr-2" />
          Adicionar Unidade
        </Button>
      </div>
      {company.metadata?.units && company.metadata.units.length > 0 ? (
        <div className="space-y-3">
          {company.metadata.units.map((unit, index) => (
            <div key={unit.id || index} className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium">{unit.fantasy_name || `Unidade ${index + 1}`}</h4>
              {unit.address && <p className="text-sm text-muted-foreground">{unit.address}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Nenhuma unidade cadastrada</p>
      )}
    </div>
  );
}
