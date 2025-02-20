
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import { useCompanyAPI } from "@/hooks/useCompanyAPI";

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
  onDataFetched?: (data: any) => void;
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
  onDataFetched
}: BasicInfoProps) {
  const { fetchCNPJData } = useCompanyAPI();

  const getRiskLevelVariant = (level: string) => {
    const riskNumber = parseInt(level);
    if (riskNumber <= 2) return "success";
    if (riskNumber === 3) return "warning";
    return "destructive";
  };

  const handleCNPJBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.replace(/\D/g, '').length === 14) {
      console.log('Consultando CNPJ:', value);
      const response = await fetchCNPJData(value);
      
      if (response && onDataFetched) {
        console.log('Dados recebidos do CNPJ:', response);
        onDataFetched(response);
      }
    }
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
          onBlur={handleCNPJBlur}
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
          placeholder="0000-0"
          value={cnae}
          onChange={onCNAEChange}
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
