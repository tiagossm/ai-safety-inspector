
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface BasicInfoProps {
  cnpj: string;
  fantasyName: string;
  cnae: string;
  riskLevel: string;
  employeeCount: string;
  onCNPJChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFantasyNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCNAEChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEmployeeCountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function BasicInfo({
  cnpj,
  fantasyName,
  cnae,
  riskLevel,
  employeeCount,
  onCNPJChange,
  onFantasyNameChange,
  onCNAEChange,
  onEmployeeCountChange,
}: BasicInfoProps) {
  const getRiskLevelVariant = (level: string) => {
    const riskNumber = parseInt(level);
    if (riskNumber <= 2) return "success";
    if (riskNumber === 3) return "warning";
    return "danger";
  };

  const formatCNAE = (value: string) => {
    // Remove caracteres não numéricos
    const numbers = value.replace(/[^\d]/g, '');
    
    // Formata para XXXX-X
    if (numbers.length >= 4) {
      return `${numbers.slice(0, 4)}${numbers.length >= 5 ? '-' + numbers.slice(4, 5) : ''}`;
    }
    return numbers;
  };

  const handleCNAEChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCNAE(e.target.value);
    e.target.value = formattedValue;
    onCNAEChange(e);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="cnpj">CNPJ da Empresa</Label>
        <Input
          id="cnpj"
          placeholder="00.000.000/0000-00"
          value={cnpj}
          onChange={onCNPJChange}
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
          onChange={onFantasyNameChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cnae">CNAE</Label>
        <Input
          id="cnae"
          placeholder="XXXX-X"
          value={cnae}
          onChange={handleCNAEChange}
          maxLength={6}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="riskLevel">Grau de Risco (NR 4)</Label>
        <div className="flex items-center space-x-2">
          <Input
            id="riskLevel"
            value={riskLevel}
            readOnly
            className="flex-1"
          />
          {riskLevel && (
            <Badge variant={getRiskLevelVariant(riskLevel)}>
              Risco {riskLevel}
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="employeeCount">Quantidade de Funcionários</Label>
        <Input
          id="employeeCount"
          type="number"
          placeholder="Ex: 50"
          value={employeeCount}
          onChange={onEmployeeCountChange}
          min="0"
        />
      </div>
    </div>
  );
}
