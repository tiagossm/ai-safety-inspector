
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useCompanyAPI } from "@/hooks/useCompanyAPI";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { formatCNPJ } from "@/utils/formatters";
import { supabase } from "@/integrations/supabase/client";
import { UnitBasicFields } from "./form/UnitBasicFields";
import { UnitTypeField } from "./form/UnitTypeField";
import { UnitContactFields } from "./form/UnitContactFields";
import { UnitEmployeeFields } from "./form/UnitEmployeeFields";
import { CIPADimensioning } from "@/types/cipa";

const unitFormSchema = z.object({
  fantasy_name: z.string().optional().nullable(),
  cnpj: z.string().min(14, 'CNPJ deve ter 14 dígitos'),
  cnae: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  unit_type: z.enum(['matriz', 'filial']),
  contact_name: z.string().optional().nullable(),
  contact_email: z.string().email().optional().nullable(),
  contact_phone: z.string().optional().nullable(),
  technical_responsible: z.string().optional().nullable(),
  employee_count: z.number().min(0, 'Número de funcionários deve ser maior ou igual a 0').optional().nullable(),
});

type UnitFormValues = z.infer<typeof unitFormSchema>;

interface UnitFormProps {
  onSubmit: (data: UnitFormValues) => Promise<void>;
}

export function UnitForm({ onSubmit }: UnitFormProps) {
  const { fetchCNPJData, fetchRiskLevel } = useCompanyAPI();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [riskLevel, setRiskLevel] = useState("");
  const [cipaDimensioning, setCipaDimensioning] = useState<CIPADimensioning | null>(null);
  const [showDesignateMessage, setShowDesignateMessage] = useState(false);

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: {
      fantasy_name: '',
      cnpj: '',
      cnae: '',
      address: '',
      unit_type: 'filial',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      technical_responsible: '',
      employee_count: null,
    },
  });

  const getRiskLevelVariant = (level: string) => {
    const riskNumber = parseInt(level);
    if (riskNumber <= 2) return "success";
    if (riskNumber === 3) return "warning";
    return "danger";
  };

  const determineSector = (cnae: string) => {
    const cnaeGroup = cnae.replace(/[^\d]/g, '').slice(0, 2);
    if (['01', '02', '03'].includes(cnaeGroup)) return 'rural';
    if (['05', '06', '07', '08', '09'].includes(cnaeGroup)) return 'mining';
    return 'general';
  };

  const handleEmployeeCountChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value);
    form.setValue('employee_count', count);
    
    if (!isNaN(count) && count >= 0 && form.getValues('cnae')) {
      const riskGrade = parseInt(riskLevel);
      if (!isNaN(riskGrade)) {
        try {
          // Verifica se é menos de 20 funcionários com grau de risco 4
          if (count < 20 && riskGrade === 4) {
            setCipaDimensioning(null);
            setShowDesignateMessage(true);
            return;
          } else {
            setShowDesignateMessage(false);
          }

          const cnae = form.getValues('cnae');
          const cleanCnae = cnae.replace(/[^\d]/g, '');
          const sector = determineSector(cleanCnae);

          console.log('Calculando dimensionamento com:', {
            count,
            cnae: cleanCnae,
            riskLevel: riskGrade,
            sector
          });

          const { data, error } = await supabase.rpc('get_cipa_dimensioning', {
            p_employee_count: count,
            p_cnae: cleanCnae,
            p_risk_level: riskGrade
          });

          if (error) {
            console.error('Erro ao calcular dimensionamento:', error);
            return;
          }

          console.log('Dimensionamento calculado:', data);
          
          if (data) {
            const dimensioning = data as CIPADimensioning;
            
            // Verifica se o dimensionamento retornou valores vazios
            if (!dimensioning || (dimensioning.efetivos === 0 && dimensioning.suplentes === 0)) {
              if (count < 20 && riskGrade === 4) {
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
          }
        } catch (error) {
          console.error('Erro ao calcular dimensionamento:', error);
        }
      }
    } else {
      setCipaDimensioning(null);
      setShowDesignateMessage(false);
    }
  };

  const handleCNPJBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.replace(/\D/g, '').length === 14) {
      setLoading(true);
      try {
        const response = await fetchCNPJData(value);
        if (response) {
          form.setValue('fantasy_name', response.fantasyName);
          form.setValue('cnae', response.cnae);
          form.setValue('address', response.address || '');
          form.setValue('contact_email', response.contactEmail || '');
          form.setValue('contact_phone', response.contactPhone || '');
          form.setValue('contact_name', response.contactName || '');
          
          if (response.cnae) {
            const risk = await fetchRiskLevel(response.cnae);
            setRiskLevel(risk);

            const employeeCount = form.getValues('employee_count');
            if (employeeCount !== null && !isNaN(employeeCount)) {
              const riskGrade = parseInt(risk);
              if (!isNaN(riskGrade)) {
                // Verifica se é menos de 20 funcionários com grau de risco 4
                if (employeeCount < 20 && riskGrade === 4) {
                  setCipaDimensioning(null);
                  setShowDesignateMessage(true);
                } else {
                  const { data } = await supabase.rpc('get_cipa_dimensioning', {
                    p_employee_count: employeeCount,
                    p_cnae: response.cnae,
                    p_risk_level: riskGrade
                  });
                  
                  if (data) {
                    setCipaDimensioning(data as CIPADimensioning);
                    setShowDesignateMessage(false);
                  }
                }
              }
            }
          }
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

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCNPJ = formatCNPJ(e.target.value);
    form.setValue('cnpj', formattedCNPJ);
  };

  // Se o cnae mudar, tenta obter o grau de risco novamente
  useEffect(() => {
    const cnae = form.getValues('cnae');
    if (cnae) {
      fetchRiskLevel(cnae).then(risk => {
        setRiskLevel(risk);
        
        // Recalcula o dimensionamento se necessário
        const employeeCount = form.getValues('employee_count');
        if (employeeCount) {
          const input = { target: { value: employeeCount.toString() } } as React.ChangeEvent<HTMLInputElement>;
          handleEmployeeCountChange(input);
        }
      });
    }
  }, [form.watch('cnae')]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <UnitBasicFields
          form={form}
          loading={loading}
          riskLevel={riskLevel}
          handleCNPJBlur={handleCNPJBlur}
          handleCNPJChange={handleCNPJChange}
          getRiskLevelVariant={getRiskLevelVariant}
        />

        <UnitEmployeeFields
          form={form}
          handleEmployeeCountChange={handleEmployeeCountChange}
          cipaDimensioning={cipaDimensioning}
          showDesignateMessage={showDesignateMessage}
        />

        <UnitTypeField form={form} />

        <UnitContactFields form={form} />

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>Salvar</Button>
        </div>
      </form>
    </Form>
  );
}
