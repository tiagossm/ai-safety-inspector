
import React from "react";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from "react-hook-form";
import { ActionPlanFormValues } from "./types";
import { CheckCircle2, AlertCircle, Clock, Ban } from "lucide-react";

interface ActionPlanStatusFieldProps {
  form: UseFormReturn<ActionPlanFormValues>;
}

export function ActionPlanStatusField({ form }: ActionPlanStatusFieldProps) {
  return (
    <FormField
      control={form.control}
      name="status"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Status</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="grid grid-cols-2 gap-2"
            >
              <Label
                htmlFor="pending"
                className={`flex flex-col items-center justify-center border rounded-md p-3 cursor-pointer transition-all hover:bg-accent ${
                  field.value === "pending" ? "bg-accent border-accent" : "border-input"
                }`}
              >
                <RadioGroupItem
                  value="pending"
                  id="pending"
                  className="sr-only"
                />
                <AlertCircle className="h-5 w-5 text-yellow-500 mb-1" />
                <span className="text-sm font-medium">Pendente</span>
              </Label>
              
              <Label
                htmlFor="in_progress"
                className={`flex flex-col items-center justify-center border rounded-md p-3 cursor-pointer transition-all hover:bg-accent ${
                  field.value === "in_progress" ? "bg-accent border-accent" : "border-input"
                }`}
              >
                <RadioGroupItem
                  value="in_progress"
                  id="in_progress"
                  className="sr-only"
                />
                <Clock className="h-5 w-5 text-blue-500 mb-1" />
                <span className="text-sm font-medium">Em Andamento</span>
              </Label>
              
              <Label
                htmlFor="completed"
                className={`flex flex-col items-center justify-center border rounded-md p-3 cursor-pointer transition-all hover:bg-accent ${
                  field.value === "completed" ? "bg-accent border-accent" : "border-input"
                }`}
              >
                <RadioGroupItem
                  value="completed"
                  id="completed"
                  className="sr-only"
                />
                <CheckCircle2 className="h-5 w-5 text-green-500 mb-1" />
                <span className="text-sm font-medium">Concluído</span>
              </Label>
              
              <Label
                htmlFor="cancelled"
                className={`flex flex-col items-center justify-center border rounded-md p-3 cursor-pointer transition-all hover:bg-accent ${
                  field.value === "cancelled" ? "bg-accent border-accent" : "border-input"
                }`}
              >
                <RadioGroupItem
                  value="cancelled"
                  id="cancelled"
                  className="sr-only"
                />
                <Ban className="h-5 w-5 text-gray-500 mb-1" />
                <span className="text-sm font-medium">Cancelado</span>
              </Label>
            </RadioGroup>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
