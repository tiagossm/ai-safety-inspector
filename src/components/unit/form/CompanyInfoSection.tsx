
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UseFormReturn } from "react-hook-form";
import { UnitFormValues } from "../UnitForm";

interface CompanyInfoSectionProps {
  form: UseFormReturn<UnitFormValues>;
  riskLevel: string;
  getRiskLevelVariant: (level: string) => "success" | "warning" | "destructive";
}

export function CompanyInfoSection({ form, riskLevel, getRiskLevelVariant }: CompanyInfoSectionProps) {
  return (
    <>
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
    </>
  );
}
