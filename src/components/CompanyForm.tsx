
import { Button } from "@/components/ui/button";
import { useCompanyForm } from "@/hooks/useCompanyForm";
import { CNPJInput } from "@/components/company/form/CNPJInput";
import { CompanyBasicFields } from "@/components/company/form/CompanyBasicFields";
import { CompanyContactFields } from "@/components/company/form/CompanyContactFields";
import { useAuth } from "@/components/AuthProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CIPADimensioning } from "@/components/unit/CIPADimensioning";

interface CompanyFormProps {
  onCompanyCreated?: () => void;
}

export function CompanyForm({ onCompanyCreated }: CompanyFormProps) {
  const { formState, handlers, getRiskLevelVariant } = useCompanyForm(onCompanyCreated);
  const { user } = useAuth();
  const [employeeCount, setEmployeeCount] = useState<number | null>(null);
  const [cipaDimensioning, setCipaDimensioning] = useState(null);

  const handleSubmit = (e: React.FormEvent) => {
    if (!user) return;
    handlers.handleSubmit(e, user.id);
  };

  const handleEmployeeCountChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value);
    setEmployeeCount(count);
    
    if (!isNaN(count) && count >= 0 && formState.cnae && formState.riskLevel) {
      try {
        // Remove formatação do CNAE e pega os primeiros 2 dígitos para verificar o grupo
        const cleanCnae = formState.cnae.replace(/[^\d]/g, '');
        const cnaeGroup = cleanCnae.slice(0, 2);
        
        console.log('Calculando dimensionamento com:', {
          count,
          cnae: cleanCnae,
          riskLevel: parseInt(formState.riskLevel),
          cnaeGroup
        });

        const { data: dimensioning, error } = await supabase.rpc('get_cipa_dimensioning', {
          p_employee_count: count,
          p_cnae: cleanCnae.slice(0, 4), // Usa apenas os 4 primeiros dígitos
          p_risk_level: parseInt(formState.riskLevel)
        });

        if (error) {
          console.error('Erro ao calcular dimensionamento:', error);
          return;
        }

        console.log('Dimensionamento calculado:', dimensioning);
        setCipaDimensioning(dimensioning);
      } catch (error) {
        console.error('Erro ao calcular dimensionamento:', error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 max-w-2xl mx-auto">
      <CNPJInput
        cnpj={formState.cnpj}
        loading={formState.loading}
        onChange={handlers.handleCNPJChange}
        onBlur={handlers.handleCNPJBlur}
      />

      <CompanyBasicFields
        fantasyName={formState.fantasyName}
        cnae={formState.cnae}
        riskLevel={formState.riskLevel}
        address={formState.address}
        getRiskLevelVariant={getRiskLevelVariant}
      />

      <div className="space-y-2">
        <Label htmlFor="employeeCount">Quantidade de Funcionários</Label>
        <Input
          id="employeeCount"
          type="number"
          min="0"
          value={employeeCount || ''}
          onChange={handleEmployeeCountChange}
          placeholder="Digite o número de funcionários"
        />
      </div>

      {cipaDimensioning && <CIPADimensioning dimensioning={cipaDimensioning} />}

      <CompanyContactFields
        contactName={formState.contactName}
        contactPhone={formState.contactPhone}
        contactEmail={formState.contactEmail}
      />

      <div className="pt-4 flex justify-end">
        <Button 
          type="submit" 
          disabled={!formState.cnpj || !formState.fantasyName || formState.loading}
        >
          {formState.loading ? "Carregando..." : "Cadastrar Empresa"}
        </Button>
      </div>
    </form>
  );
}
