
import { Button } from "@/components/ui/button";
import { useCompanyForm } from "@/hooks/useCompanyForm";
import { CNPJInput } from "@/components/company/form/CNPJInput";
import { CompanyBasicFields } from "@/components/company/form/CompanyBasicFields";
import { CompanyContactFields } from "@/components/company/form/CompanyContactFields";
import { useAuth } from "@/components/AuthProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CIPADimensioning } from "@/components/unit/CIPADimensioning";
import { Badge } from "@/components/ui/badge";

interface CompanyFormProps {
  onCompanyCreated?: () => void;
}

export function CompanyForm({ onCompanyCreated }: CompanyFormProps) {
  const { formState, handlers, getRiskLevelVariant } = useCompanyForm(onCompanyCreated);
  const { user } = useAuth();
  const [employeeCount, setEmployeeCount] = useState<number | null>(null);
  const [cipaDimensioning, setCipaDimensioning] = useState(null);
  const [showDesignateMessage, setShowDesignateMessage] = useState(false);

  const determineSector = (cnae: string) => {
    const cnaeGroup = cnae.replace(/[^\d]/g, '').slice(0, 2);
    if (['01', '02', '03'].includes(cnaeGroup)) return 'rural';
    if (['05', '06', '07', '08', '09'].includes(cnaeGroup)) return 'mining';
    return 'general';
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (!user) return;
    // Passa o dimensionamento para o metadata
    if (cipaDimensioning || showDesignateMessage) {
      const metadata = {
        risk_grade: formState.riskLevel,
        cipa_dimensioning: showDesignateMessage ? 
          { message: 'Designar 1 representante da CIPA' } : 
          cipaDimensioning
      };
      handlers.handleSubmitWithMetadata(e, user.id, metadata);
    } else {
      handlers.handleSubmit(e, user.id);
    }
  };

  const handleEmployeeCountChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value);
    setEmployeeCount(count);
    
    if (!isNaN(count) && count >= 0 && formState.cnae && formState.riskLevel) {
      try {
        // Verifica se é menos de 20 funcionários com grau de risco 4
        const riskLevel = parseInt(formState.riskLevel);
        if (count < 20 && riskLevel === 4) {
          setCipaDimensioning(null);
          setShowDesignateMessage(true);
          return;
        } else {
          setShowDesignateMessage(false);
        }

        const cleanCnae = formState.cnae.replace(/[^\d]/g, '');
        const sector = determineSector(cleanCnae);
        
        console.log('Calculando dimensionamento com:', {
          count,
          cnae: cleanCnae,
          riskLevel: parseInt(formState.riskLevel),
          sector
        });

        const { data: dimensioning, error } = await supabase.rpc('get_cipa_dimensioning', {
          p_employee_count: count,
          p_cnae: cleanCnae,
          p_risk_level: parseInt(formState.riskLevel)
        });

        if (error) {
          console.error('Erro ao calcular dimensionamento:', error);
          return;
        }

        console.log('Dimensionamento calculado:', dimensioning);
        
        // Verifica se o dimensionamento retornou valores vazios
        if (!dimensioning || (dimensioning.efetivos === 0 && dimensioning.suplentes === 0)) {
          if (count < 20 && riskLevel === 4) {
            setCipaDimensioning(null);
            setShowDesignateMessage(true);
          } else {
            setCipaDimensioning({
              efetivos: 0,
              suplentes: 0,
              observacao: 'Não foi possível calcular o dimensionamento',
              norma: sector === 'mining' ? 'NR-22' : sector === 'rural' ? 'NR-31' : 'NR-5'
            });
            setShowDesignateMessage(false);
          }
        } else {
          setCipaDimensioning(dimensioning);
          setShowDesignateMessage(false);
        }
      } catch (error) {
        console.error('Erro ao calcular dimensionamento:', error);
        setCipaDimensioning(null);
        setShowDesignateMessage(false);
      }
    } else {
      setCipaDimensioning(null);
      setShowDesignateMessage(false);
    }
  };

  // Se o cnae ou o riskLevel mudar, tenta recalcular o dimensionamento
  useEffect(() => {
    if (employeeCount && employeeCount > 0) {
      const input = { target: { value: employeeCount.toString() } } as React.ChangeEvent<HTMLInputElement>;
      handleEmployeeCountChange(input);
    }
  }, [formState.cnae, formState.riskLevel]);

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
      
      {showDesignateMessage && (
        <div className="mt-4 p-4 border rounded-md">
          <h3 className="text-lg font-medium mb-2">Dimensionamento CIPA</h3>
          <Badge variant="outline" className="font-medium">
            Designar 1 representante da CIPA
          </Badge>
          <p className="text-sm text-muted-foreground mt-2">
            Empresas com menos de 20 funcionários e grau de risco 4 devem designar 1 representante da CIPA.
          </p>
        </div>
      )}

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
