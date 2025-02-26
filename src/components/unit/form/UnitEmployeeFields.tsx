
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface UnitEmployeeFieldsProps {
  form: UseFormReturn<any>;
  handleEmployeeCountChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  cipaDimensioning: any;
}

export function UnitEmployeeFields({ 
  form, 
  handleEmployeeCountChange,
  cipaDimensioning 
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
    </>
  );
}
