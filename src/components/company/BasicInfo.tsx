
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
          placeholder="00.00-0-00"
          value={cnae}
          onChange={onCNAEChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="riskLevel">Grau de Risco (NR 4)</Label>
        <Input
          id="riskLevel"
          value={riskLevel}
          readOnly
        />
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
