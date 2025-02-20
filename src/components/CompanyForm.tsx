
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useCompanyAPI } from "@/hooks/useCompanyAPI";
import { formatCNPJ } from "@/utils/formatters";
import { useState } from "react";
import { useToast } from "./ui/use-toast";

interface CompanyFormProps {
  onCompanyCreated?: () => void;
}

export function CompanyForm({ onCompanyCreated }: CompanyFormProps) {
  const [cnpj, setCnpj] = useState("");
  const [fantasyName, setFantasyName] = useState("");
  const [cnae, setCnae] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const { fetchCNPJData } = useCompanyAPI();
  const { toast } = useToast();

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCNPJ = formatCNPJ(e.target.value);
    setCnpj(formattedCNPJ);
  };

  const handleCNPJBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.replace(/\D/g, '').length === 14) {
      setLoading(true);
      try {
        const response = await fetchCNPJData(value);
        if (response) {
          setFantasyName(response.fantasyName);
          setCnae(response.cnae);
          setRiskLevel(response.riskLevel);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do CNPJ:', error);
        toast({
          title: "Erro ao buscar dados",
          description: "Não foi possível consultar os dados do CNPJ",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const getRiskLevelVariant = (level: string) => {
    const riskNumber = parseInt(level);
    if (riskNumber <= 2) return "success";
    if (riskNumber === 3) return "warning";
    return "destructive";
  };

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <Label htmlFor="cnpj">CNPJ da Empresa</Label>
        <Input
          id="cnpj"
          placeholder="00.000.000/0000-00"
          value={cnpj}
          onChange={handleCNPJChange}
          onBlur={handleCNPJBlur}
          maxLength={18}
          disabled={loading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fantasyName">Nome Fantasia</Label>
        <Input
          id="fantasyName"
          value={fantasyName}
          readOnly
          className="bg-gray-50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cnae">CNAE</Label>
        <Input
          id="cnae"
          value={cnae}
          readOnly
          className="bg-gray-50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="riskLevel">Grau de Risco (NR 4)</Label>
        <div className="flex items-center space-x-2">
          <Input
            id="riskLevel"
            value={riskLevel}
            readOnly
            className="bg-gray-50 flex-1"
          />
          {riskLevel && (
            <Badge variant={getRiskLevelVariant(riskLevel)}>
              Risco {riskLevel}
            </Badge>
          )}
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={!cnpj || !fantasyName || loading}>
          {loading ? "Carregando..." : "Cadastrar Empresa"}
        </Button>
      </div>
    </div>
  );
}
