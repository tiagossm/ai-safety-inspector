
import { CompanyMetadata } from "@/types/company";

interface CompanyUnitsProps {
  units: CompanyMetadata['units'];
  expanded: boolean;
}

export function CompanyUnits({ units, expanded }: CompanyUnitsProps) {
  if (!expanded || !units?.length) return null;

  return (
    <div className="mt-4 space-y-2">
      <h4 className="font-medium">Unidades Vinculadas:</h4>
      {units.map((unit, index) => (
        <div key={index} className="pl-4 border-l-2 border-muted">
          <p className="font-medium">{unit.name || `Unidade ${index + 1}`}</p>
          {unit.address && <p className="text-xs">{unit.address}</p>}
        </div>
      ))}
    </div>
  );
}
