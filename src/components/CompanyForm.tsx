import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useCompanyAPI } from "@/hooks/useCompanyAPI";
import { formatCNPJ } from "@/utils/formatters";
import { useState } from "react";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CompanyFormProps {
  onCompanyCreated?: () => void;
}

export function CompanyForm({ onCompanyCreated }: CompanyFormProps) {
  const [cnpj, setCnpj] = useState("");
  const [fantasyName, setFantasyName] = useState("");
  const [cnae, setCnae] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [address, setAddress] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactName, setContactName] = useState("");
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
          setAddress(response.address || '');
          setContactEmail(response.contactEmail || '');
          setContactPhone(response.contactPhone || '');
          setContactName(response.contactName || '');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cnpj || !fantasyName) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('companies').insert({
        cnpj: cnpj.replace(/\D/g, ''),
        fantasy_name: fantasyName,
        cnae,
        risk_level: riskLevel,
        address,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        contact_name: contactName,
        status: 'active'
      });

      if (error) throw error;

      toast({
        title: "Empresa cadastrada com sucesso!",
        description: "A empresa foi adicionada ao sistema.",
      });

      onCompanyCreated?.();
    } catch (error: any) {
      console.error('Erro ao cadastrar empresa:', error);
      toast({
        title: "Erro ao cadastrar empresa",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 max-w-2xl mx-auto">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contactName">Nome do Contato</Label>
          <Input
            id="contactName"
            value={contactName}
            readOnly
            className="bg-muted text-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactPhone">Telefone</Label>
          <Input
            id="contactPhone"
            value={contactPhone}
            readOnly
            className="bg-muted text-foreground"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactEmail">E-mail</Label>
        <Input
          id="contactEmail"
          value={contactEmail}
          readOnly
          className="bg-muted text-foreground"
        />
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={!cnpj || !fantasyName || loading}>
          {loading ? "Carregando..." : "Cadastrar Empresa"}
        </Button>
      </div>
    </form>
  );
}
