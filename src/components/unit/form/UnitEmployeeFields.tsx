
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CIPADimensioning } from "@/components/unit/CIPADimensioning";
import { Badge } from "@/components/ui/badge";

interface UnitEmployeeFieldsProps {
  form: UseFormReturn<any>;
  handleEmployeeCountChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  cipaDimensioning: any;
  showDesignateMessage?: boolean;
}

export function UnitEmployeeFields({ 
  form, 
  handleEmployeeCountChange,
  cipaDimensioning,
  showDesignateMessage = false
}: UnitEmployeeFieldsProps) {
  return (
    <>
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
    </>
  );
}
