
import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ActionPlanFormValues } from "./types";

interface ActionPlanAssigneeFieldProps {
  form: UseFormReturn<ActionPlanFormValues>;
}

export function ActionPlanAssigneeField({ form }: ActionPlanAssigneeFieldProps) {
  return (
    <FormField
      control={form.control}
      name="assignee"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Assignee</FormLabel>
          <FormControl>
            <Input
              placeholder="Person responsible for this action"
              {...field}
              value={field.value || ""}
            />
          </FormControl>
          <FormDescription>
            Enter the name of the person responsible for this action
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
