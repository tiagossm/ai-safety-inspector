
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

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
  getRiskLevelVariant 
}: CompanyBasicFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="fantasyName">Nome Fantasia</Label>
        <Input
          id="fantasyName"
          value={fantasyName}
          readOnly
          className="bg-muted text-foreground"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cnae">CNAE</Label>
          <Input
            id="cnae"
            value={cnae}
            readOnly
            className="bg-muted text-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="riskLevel">Grau de Risco (NR 4)</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="riskLevel"
              value={riskLevel}
              readOnly
              className="bg-muted text-foreground flex-1"
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
        <Label htmlFor="address">Endereço</Label>
        <Input
          id="address"
          value={address}
          readOnly
          className="bg-muted text-foreground"
        />
      </div>
    </>
  );
}
