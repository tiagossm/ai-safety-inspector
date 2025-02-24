
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompanyAPI } from "@/hooks/useCompanyAPI";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { formatCNPJ } from "@/utils/formatters";
import { Badge } from "@/components/ui/badge";
import { CIPADimensioning } from "./CIPADimensioning";

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
    return "destructive";
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

            // Calcular dimensionamento inicial se houver número de funcionários
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
        <FormField
          control={form.control}
          name="cnpj"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CNPJ</FormLabel>
              <FormControl>
                <Input 
                  placeholder="00.000.000/0000-00" 
                  {...field} 
                  onChange={handleCNPJChange}
                  onBlur={handleCNPJBlur}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fantasy_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Fantasia</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Nome Fantasia" 
                  {...field} 
                  value={field.value || ''} 
                  readOnly
                  className="bg-muted"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cnae"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CNAE</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="CNAE" 
                    {...field} 
                    value={field.value || ''} 
                    readOnly
                    className="bg-muted"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>Grau de Risco (NR 4)</FormLabel>
            <div className="flex items-center space-x-2">
              <Input
                value={riskLevel}
                readOnly
                className="bg-muted flex-1"
              />
              {riskLevel && (
                <Badge variant={getRiskLevelVariant(riskLevel)}>
                  Risco {riskLevel}
                </Badge>
              )}
            </div>
          </FormItem>
        </div>

        <FormField
          control={form.control}
          name="employee_count"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Funcionários</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  placeholder="Digite o número de funcionários" 
                  onChange={handleEmployeeCountChange}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {cipaDimensioning && <CIPADimensioning dimensioning={cipaDimensioning} />}

        <FormField
          control={form.control}
          name="unit_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Unidade</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="matriz">Matriz</SelectItem>
                  <SelectItem value="filial">Filial</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Endereço completo" 
                  {...field} 
                  value={field.value || ''} 
                  readOnly
                  className="bg-muted"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Contato</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Nome do contato" 
                  {...field} 
                  value={field.value || ''} 
                  readOnly
                  className="bg-muted"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contact_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email do Contato</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="email@exemplo.com" 
                    {...field} 
                    value={field.value || ''} 
                    readOnly
                    className="bg-muted"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone do Contato</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="(00) 00000-0000" 
                    {...field} 
                    value={field.value || ''} 
                    readOnly
                    className="bg-muted"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="technical_responsible"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsável Técnico</FormLabel>
              <FormControl>
                <Input placeholder="Nome do responsável técnico" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>Salvar</Button>
        </div>
      </form>
    </Form>
  );
}
