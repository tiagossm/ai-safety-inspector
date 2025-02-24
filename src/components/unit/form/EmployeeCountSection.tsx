
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UnitFormValues } from "../UnitForm";

interface EmployeeCountSectionProps {
  form: UseFormReturn<UnitFormValues>;
  handleEmployeeCountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  cipaDimensioning: any;
}

export function EmployeeCountSection({
  form,
  handleEmployeeCountChange,
  cipaDimensioning
}: EmployeeCountSectionProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="employee_count"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de Funcionários</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                {...field}
                onChange={handleEmployeeCountChange}
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {cipaDimensioning && (
        <Card>
          <CardContent className="pt-6">
            <h4 className="text-sm font-semibold mb-2">Dimensionamento CIPA:</h4>
            <div className="space-y-2">
              {cipaDimensioning.efetivos && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">Membros Efetivos:</span>
                  <Badge variant="secondary">{cipaDimensioning.efetivos}</Badge>
                </div>
              )}
              {cipaDimensioning.suplentes && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">Membros Suplentes:</span>
                  <Badge variant="secondary">{cipaDimensioning.suplentes}</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
