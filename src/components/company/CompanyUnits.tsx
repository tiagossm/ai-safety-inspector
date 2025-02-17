
import { useState } from "react";
import { Company, CompanyUnit } from "@/types/company";
import { Button } from "@/components/ui/button";
import { BuildingIcon, ChevronDown, ChevronUp, Mail, Phone, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompanyUnitsProps {
  company: Company;
  onAddUnit: () => void;
}

export function CompanyUnits({ company, onAddUnit }: CompanyUnitsProps) {
  const [expandedUnits, setExpandedUnits] = useState<string[]>([]);

  const toggleUnitExpansion = (unitId: string) => {
    setExpandedUnits(prev => 
      prev.includes(unitId) 
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  console.log("CompanyUnits rendered. Units:", company.metadata?.units);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Unidades</h3>
        <Button variant="outline" size="sm" onClick={() => {
          console.log("Add unit clicked");
          onAddUnit();
        }}>
          <BuildingIcon className="h-4 w-4 mr-2" />
          Adicionar Unidade
        </Button>
      </div>
      {company.metadata?.units && company.metadata.units.length > 0 ? (
        <div className="space-y-3">
          {company.metadata.units.map((unit, index) => (
            <div key={unit.id || index} className="border rounded-lg overflow-hidden">
              <div 
                className="p-4 bg-muted/50 flex items-center justify-between cursor-pointer"
                onClick={() => toggleUnitExpansion(unit.id)}
              >
                <div>
                  <h4 className="font-medium">{unit.fantasy_name || `Unidade ${index + 1}`}</h4>
                  <p className="text-sm text-muted-foreground">{unit.cnpj}</p>
                </div>
                <Button variant="ghost" size="sm">
                  {expandedUnits.includes(unit.id) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div 
                className={cn(
                  "bg-background p-4 space-y-2 transition-all",
                  expandedUnits.includes(unit.id) ? "block" : "hidden"
                )}
              >
                {unit.address && (
                  <p className="text-sm">
                    <span className="font-medium">Endereço:</span> {unit.address}
                  </p>
                )}
                {unit.contact_name && (
                  <p className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{unit.contact_name}</span>
                  </p>
                )}
                {unit.contact_email && (
                  <p className="text-sm flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${unit.contact_email}`} className="text-blue-600 hover:underline">
                      {unit.contact_email}
                    </a>
                  </p>
                )}
                {unit.contact_phone && (
                  <p className="text-sm flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{unit.contact_phone}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Nenhuma unidade cadastrada</p>
      )}
    </div>
  );
}
