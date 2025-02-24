
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { UnitFormValues } from "../UnitForm";

interface CompanyInfoSectionProps {
  form: UseFormReturn<UnitFormValues>;
  riskLevel: string;
  getRiskLevelVariant: (level: string) => "success" | "warning" | "destructive";
}

export function CompanyInfoSection({
  form,
  riskLevel,
  getRiskLevelVariant,
}: CompanyInfoSectionProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="fantasy_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome Fantasia</FormLabel>
            <FormControl>
              <Input {...field} value={field.value || ''} readOnly />
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
                <Input {...field} value={field.value || ''} readOnly />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="metadata.risk_grade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grau de Risco</FormLabel>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Input {...field} value={field.value || ''} readOnly />
                </FormControl>
                {riskLevel && (
                  <Badge variant={getRiskLevelVariant(riskLevel)}>
                    Risco {riskLevel}
                  </Badge>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Endereço</FormLabel>
            <FormControl>
              <Input {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
