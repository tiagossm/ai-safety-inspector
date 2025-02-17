
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { UnitType } from "@/types/company";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompanyAPI } from "@/hooks/useCompanyAPI";

interface UnitFormData {
  fantasy_name: string;
  cnpj: string;
  cnae: string;
  address: string;
  unit_type: UnitType | "";
  technical_responsible: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
}

export function UnitForm() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fetchCNPJData } = useCompanyAPI();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UnitFormData>({
    fantasy_name: "",
    cnpj: "",
    cnae: "",
    address: "",
    unit_type: "",
    technical_responsible: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
  });

  const [hasMatrix, setHasMatrix] = useState(false);

  useEffect(() => {
    checkExistingMatrix();
  }, []);

  const checkExistingMatrix = async () => {
    try {
      const { data } = await supabase
        .from('units')
        .select('*')
        .eq('company_id', companyId)
        .eq('unit_type', 'matriz')
        .single();

      setHasMatrix(!!data);
    } catch (error) {
      console.error('Error checking matrix:', error);
    }
  };

  const handleCNPJBlur = async () => {
    if (formData.cnpj.length >= 14) {
      const data = await fetchCNPJData(formData.cnpj);
      if (data) {
        setFormData(prev => ({
          ...prev,
          fantasy_name: data.fantasyName || prev.fantasy_name,
          cnae: data.cnae || prev.cnae,
          contact_email: data.contactEmail || prev.contact_email,
          contact_phone: data.contactPhone || prev.contact_phone,
          contact_name: data.contactName || prev.contact_name,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!companyId) throw new Error("ID da empresa não encontrado");

      // Validate CNPJ format
      const cnpjNumbers = formData.cnpj.replace(/\D/g, '');
      if (cnpjNumbers.length !== 14) {
        throw new Error("CNPJ deve ter 14 dígitos");
      }

      // Validate unit_type is set
      if (!formData.unit_type) {
        throw new Error("Selecione o tipo de unidade");
      }

      // Validate matriz/filial
      if (formData.unit_type === 'filial' && !hasMatrix) {
        throw new Error("Não é possível cadastrar uma filial sem a empresa matriz");
      }

      const { error } = await supabase
        .from('units')
        .insert({
          ...formData,
          company_id: companyId,
          unit_type: formData.unit_type as UnitType, // Type assertion here is safe because we validated above
        });

      if (error) throw error;

      toast({
        title: "Unidade cadastrada com sucesso!",
        description: "Os dados foram salvos no sistema.",
      });

      navigate(`/companies/${companyId}`);
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Erro ao cadastrar unidade",
        description: error.message || "Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input
            id="cnpj"
            value={formData.cnpj}
            onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
            onBlur={handleCNPJBlur}
            placeholder="00.000.000/0000-00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit_type">Tipo de Unidade</Label>
          <Select
            onValueChange={(value) => setFormData(prev => ({ ...prev, unit_type: value }))}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {!hasMatrix && (
                <SelectItem value="matriz">Matriz</SelectItem>
              )}
              <SelectItem value="filial">Filial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fantasy_name">Nome Fantasia</Label>
          <Input
            id="fantasy_name"
            value={formData.fantasy_name}
            onChange={(e) => setFormData(prev => ({ ...prev, fantasy_name: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cnae">CNAE</Label>
          <Input
            id="cnae"
            value={formData.cnae}
            onChange={(e) => setFormData(prev => ({ ...prev, cnae: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Endereço</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="technical_responsible">Responsável Técnico</Label>
          <Input
            id="technical_responsible"
            value={formData.technical_responsible}
            onChange={(e) => setFormData(prev => ({ ...prev, technical_responsible: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_name">Nome do Contato</Label>
          <Input
            id="contact_name"
            value={formData.contact_name}
            onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_email">Email do Contato</Label>
          <Input
            id="contact_email"
            type="email"
            value={formData.contact_email}
            onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_phone">Telefone do Contato</Label>
          <Input
            id="contact_phone"
            value={formData.contact_phone}
            onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(`/companies/${companyId}`)}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Cadastrando..." : "Cadastrar Unidade"}
        </Button>
      </div>
    </form>
  );
}
