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
import { CNPJSection } from "./form/CNPJSection";
import { CompanyInfoSection } from "./form/CompanyInfoSection";
import { EmployeeCountSection } from "./form/EmployeeCountSection";
import { UnitTypeSection } from "./form/UnitTypeSection";
import { ContactSection } from "./form/ContactSection";

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
  metadata: z.object({
    risk_grade: z.string().optional()
  }).optional().nullable(),
});

export type UnitFormValues = z.infer<typeof unitFormSchema>;

interface UnitFormProps {
  onSubmit: (data: UnitFormValues) => Promise<void>;
}

export function UnitForm({ onSubmit }: UnitFormProps) {
  const { fetchCNPJData, fetchRiskLevel } = useCompanyAPI();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [riskLevel, setRiskLevel] = useState("");
  const [cipaDimensioning, setCipaDimensioning] = useState<any>(null);

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
      employee_count: 0,
      metadata: {
        risk_grade: ''
      }
    },
  });

  const getRiskLevelVariant = (level: string) => {
    const riskNumber = parseInt(level);
    if (riskNumber <= 2) return "success";
    if (riskNumber === 3) return "warning";
    return "destructive";
  };

  const calculateCIPADimensioning = async (count: number, cnae: string | null, risk: string) => {
    if (!cnae || !risk) {
      console.log('CNAE ou risco não fornecidos para cálculo do dimensionamento');
      return;
    }
    
    try {
      console.log('Calculando dimensionamento:', { count, cnae, risk });
      const { data: dimensioning, error } = await supabase.rpc('get_cipa_dimensioning', {
        p_employee_count: count,
        p_cnae: cnae,
        p_risk_level: parseInt(risk)
      });

      if (error) {
        console.error('Erro na função RPC:', error);
        throw error;
      }
      
      console.log('Dimensionamento calculado:', dimensioning);
      setCipaDimensioning(dimensioning);
    } catch (error) {
      console.error('Erro ao calcular dimensionamento:', error);
      toast({
        title: "Erro ao calcular dimensionamento",
        description: "Não foi possível calcular o dimensionamento da CIPA",
        variant: "destructive",
      });
    }
  };

  const handleEmployeeCountChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value);
    if (isNaN(count)) return;
    
    form.setValue('employee_count', count);
    console.log('Número de funcionários alterado:', count);
    
    const cnae = form.getValues('cnae');
    const currentRiskLevel = form.getValues('metadata.risk_grade');
    
    if (count >= 0 && cnae && currentRiskLevel) {
      console.log('Chamando calculateCIPADimensioning com:', { count, cnae, currentRiskLevel });
      await calculateCIPADimensioning(count, cnae, currentRiskLevel);
    } else {
      console.log('Dados insuficientes para cálculo:', { count, cnae, currentRiskLevel });
    }
  };

  const handleCNPJBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.replace(/\D/g, '').length === 14) {
      setLoading(true);
      try {
        console.log('Buscando dados do CNPJ:', value);
        const response = await fetchCNPJData(value);
        if (response) {
          console.log('Dados do CNPJ encontrados:', response);
          form.setValue('fantasy_name', response.fantasyName);
          form.setValue('cnae', response.cnae);
          form.setValue('address', response.address || '');
          form.setValue('contact_email', response.contactEmail || '');
          form.setValue('contact_phone', response.contactPhone || '');
          form.setValue('contact_name', response.contactName || '');
          
          if (response.cnae) {
            const risk = await fetchRiskLevel(response.cnae);
            console.log('Grau de risco calculado:', risk);
            setRiskLevel(risk);
            form.setValue('metadata.risk_grade', risk);

            const employeeCount = form.getValues('employee_count');
            if (employeeCount !== null && !isNaN(employeeCount)) {
              await calculateCIPADimensioning(employeeCount, response.cnae, risk);
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
        <CNPJSection 
          form={form}
          loading={loading}
          handleCNPJChange={handleCNPJChange}
          handleCNPJBlur={handleCNPJBlur}
        />

        <CompanyInfoSection 
          form={form}
          riskLevel={riskLevel}
          getRiskLevelVariant={getRiskLevelVariant}
        />

        <EmployeeCountSection 
          form={form}
          handleEmployeeCountChange={handleEmployeeCountChange}
          cipaDimensioning={cipaDimensioning}
        />

        <UnitTypeSection form={form} />

        <ContactSection form={form} />

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>Salvar</Button>
        </div>
      </form>
    </Form>
  );
}
