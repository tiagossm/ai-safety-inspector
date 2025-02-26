import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useCompanyAPI } from "@/hooks/useCompanyAPI";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { formatCNPJ } from "@/utils/formatters";
import { supabase } from "@/integrations/supabase/client";
import { UnitBasicFields } from "./form/UnitBasicFields";
import { UnitTypeField } from "./form/UnitTypeField";
import { UnitContactFields } from "./form/UnitContactFields";
import { UnitEmployeeFields } from "./form/UnitEmployeeFields";

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
  const [cipaDimensioning, setCipaDimensioning] = useState(null);

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

  const handleEmployeeCountChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value);
    form.setValue('employee_count', count);
    
    if (!isNaN(count) && count >= 0 && form.getValues('cnae')) {
      const riskGrade = parseInt(riskLevel);
      if (!isNaN(riskGrade)) {
        try {
          const { data: dimensioning } = await supabase.rpc('get_cipa_dimensioning', {
            p_employee_count: count,
            p_cnae: form.getValues('cnae'),
            p_risk_level: riskGrade
          });
          setCipaDimensioning(dimensioning);
        } catch (error) {
          console.error('Erro ao calcular dimensionamento:', error);
        }
      }
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
                const { data: dimensioning } = await supabase.rpc('get_cipa_dimensioning', {
                  p_employee_count: employeeCount,
                  p_cnae: response.cnae,
                  p_risk_level: riskGrade
                });
                setCipaDimensioning(dimensioning);
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
