
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

interface CNPJSectionProps {
  form: UseFormReturn<UnitFormValues>;
  loading: boolean;
  handleCNPJChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCNPJBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export function CNPJSection({ form, loading, handleCNPJChange, handleCNPJBlur }: CNPJSectionProps) {
  return (
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
  );
}
