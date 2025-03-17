
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

interface UnitTypeFieldProps {
  form: UseFormReturn<any>;
}

export function UnitTypeField({ form }: UnitTypeFieldProps) {
  return (
    <FormField
      control={form.control}
      name="unit_type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tipo de Unidade</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value || "matriz"}>
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
  );
}
