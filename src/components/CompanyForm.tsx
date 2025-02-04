import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function CompanyForm() {
  const [cnpj, setCnpj] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First validate and fetch company data
      const { data: companyData, error: validationError } = await supabase.functions.invoke('validate-cnpj', {
        body: { cnpj: cnpj.replace(/\D/g, '') }
      });

      if (validationError) throw validationError;

      // Then insert into database
      const { error: insertError } = await supabase
        .from('companies')
        .insert([{
          ...companyData,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (insertError) throw insertError;
      
      toast({
        title: "Empresa cadastrada com sucesso!",
        description: "Os dados foram validados e salvos no sistema.",
      });

      // Reset form
      setCnpj("");
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro ao cadastrar empresa",
        description: error.message || "Verifique o CNPJ e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="cnpj">CNPJ da Empresa</Label>
        <Input
          id="cnpj"
          placeholder="00.000.000/0000-00"
          value={cnpj}
          onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
          maxLength={18}
          required
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Cadastrando..." : "Cadastrar Empresa"}
      </Button>
    </form>
  );
}