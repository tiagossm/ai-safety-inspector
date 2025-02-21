
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { UnitFormValues } from "../UnitForm";

interface UnitTypeSectionProps {
  form: UseFormReturn<UnitFormValues>;
}

export function UnitTypeSection({ form }: UnitTypeSectionProps) {
  return (
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
        </FormItem>
      )}
    />
  );
}
