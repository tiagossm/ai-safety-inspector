
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { UnitFormValues } from "../UnitForm";
import { CIPADimensioning } from "../CIPADimensioning";

interface EmployeeCountSectionProps {
  form: UseFormReturn<UnitFormValues>;
  handleEmployeeCountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  cipaDimensioning: any;
}

export function EmployeeCountSection({ form, handleEmployeeCountChange, cipaDimensioning }: EmployeeCountSectionProps) {
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
