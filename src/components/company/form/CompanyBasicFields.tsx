
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface CompanyBasicFieldsProps {
  fantasyName: string;
  cnae: string;
  riskLevel: string;
  address: string;
  getRiskLevelVariant: (level: string) => "success" | "warning" | "destructive";
}

export function CompanyBasicFields({
  fantasyName,
  cnae,
  riskLevel,
  address,
  getRiskLevelVariant,
}: CompanyBasicFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="fantasyName">
          Nome Fantasia
        </label>
        <Input
          id="fantasyName"
          value={fantasyName || ""}
          className="bg-muted"
          readOnly
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-1 text-sm font-medium" htmlFor="cnae">
            CNAE
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Classificação Nacional de Atividades Econômicas</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </label>
          <Input id="cnae" value={cnae || ""} className="bg-muted" readOnly />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-1 text-sm font-medium" htmlFor="riskLevel">
            Grau de Risco (NR-4)
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Classificação do grau de risco conforme NR-4. 
                    Grau 1-2: Risco baixo. 
                    Grau 3: Risco médio. 
                    Grau 4: Risco alto.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </label>
          <div className="flex items-center space-x-2">
            <Input
              id="riskLevel"
              value={riskLevel || ""}
              className="bg-muted flex-1"
              readOnly
            />
            {riskLevel && (
              <Badge variant={getRiskLevelVariant(riskLevel)}>
                Risco {riskLevel}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="address">
          Endereço
        </label>
        <Input
          id="address"
          value={address || ""}
          className="bg-muted"
          readOnly
        />
      </div>
    </div>
  );
}
