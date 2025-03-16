
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

const unitFormSchema = z.object({
  fantasy_name: z.string().optional().nullable(),
  cnpj: z.string().min(14, 'CNPJ deve ter 14 dígitos'),
  cnae: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

type UnitFormValues = z.infer<typeof unitFormSchema>;

interface UnitBasicFieldsProps {
  form: UseFormReturn<any>;
  loading: boolean;
  riskLevel: string;
  handleCNPJBlur: (e: React.FocusEvent<HTMLInputElement>) => Promise<void>;
  handleCNPJChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  getRiskLevelVariant: (level: string) => "success" | "warning" | "danger";
}

export function UnitBasicFields({ 
  form, 
  loading, 
  riskLevel, 
  handleCNPJBlur, 
  handleCNPJChange,
  getRiskLevelVariant 
}: UnitBasicFieldsProps) {
  return (
    <>
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
                onChange={(e) => {
                  handleCNPJChange(e);
                  field.onChange(e);
                }}
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
    </>
  );
}
