
import React from "react";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from "react-hook-form";
import { ActionPlanFormValues } from "./types";
import { Flame, AlertCircle, AlertTriangle, ArrowDown } from "lucide-react";

interface ActionPlanPriorityFieldProps {
  form: UseFormReturn<ActionPlanFormValues>;
}

export function ActionPlanPriorityField({ form }: ActionPlanPriorityFieldProps) {
  return (
    <FormField
      control={form.control}
      name="priority"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Prioridade</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="grid grid-cols-2 gap-2"
            >
              <Label
                htmlFor="low"
                className={`flex flex-col items-center justify-center border rounded-md p-3 cursor-pointer transition-all hover:bg-accent ${
                  field.value === "low" ? "bg-accent border-accent" : "border-input"
                }`}
              >
                <RadioGroupItem
                  value="low"
                  id="low"
                  className="sr-only"
                />
                <ArrowDown className="h-5 w-5 text-green-500 mb-1" />
                <span className="text-sm font-medium">Baixa</span>
              </Label>
              
              <Label
                htmlFor="medium"
                className={`flex flex-col items-center justify-center border rounded-md p-3 cursor-pointer transition-all hover:bg-accent ${
                  field.value === "medium" ? "bg-accent border-accent" : "border-input"
                }`}
              >
                <RadioGroupItem
                  value="medium"
                  id="medium"
                  className="sr-only"
                />
                <AlertCircle className="h-5 w-5 text-blue-500 mb-1" />
                <span className="text-sm font-medium">Média</span>
              </Label>
              
              <Label
                htmlFor="high"
                className={`flex flex-col items-center justify-center border rounded-md p-3 cursor-pointer transition-all hover:bg-accent ${
                  field.value === "high" ? "bg-accent border-accent" : "border-input"
                }`}
              >
                <RadioGroupItem
                  value="high"
                  id="high"
                  className="sr-only"
                />
                <AlertTriangle className="h-5 w-5 text-orange-500 mb-1" />
                <span className="text-sm font-medium">Alta</span>
              </Label>
              
              <Label
                htmlFor="critical"
                className={`flex flex-col items-center justify-center border rounded-md p-3 cursor-pointer transition-all hover:bg-accent ${
                  field.value === "critical" ? "bg-accent border-accent" : "border-input"
                }`}
              >
                <RadioGroupItem
                  value="critical"
                  id="critical"
                  className="sr-only"
                />
                <Flame className="h-5 w-5 text-red-500 mb-1" />
                <span className="text-sm font-medium">Crítica</span>
              </Label>
            </RadioGroup>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
