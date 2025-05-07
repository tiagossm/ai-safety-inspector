
import React from "react";
import { ActionPlanDescriptionField } from "./ActionPlanDescriptionField";
import { ActionPlanAssigneeField } from "./ActionPlanAssigneeField";
import { ActionPlanPriorityField } from "./ActionPlanPriorityField";
import { ActionPlanStatusField } from "./ActionPlanStatusField"; 
import { ActionPlanDueDateField } from "./ActionPlanDueDateField";
import { UseFormReturn } from "react-hook-form";
import { ActionPlanFormValues } from "./types";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface ActionPlanFormContentProps {
  form: UseFormReturn<ActionPlanFormValues>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function ActionPlanFormContent({
  form,
  isSubmitting,
  onCancel
}: ActionPlanFormContentProps) {
  return (
    <div className="space-y-4">
      <ActionPlanDescriptionField form={form} />
      <ActionPlanAssigneeField form={form} />
      
      <div className="grid grid-cols-2 gap-4">
        <ActionPlanPriorityField form={form} />
        <ActionPlanStatusField form={form} />
      </div>
      
      <ActionPlanDueDateField form={form} />

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Plano de Ação"
          )}
        </Button>
      </DialogFooter>
    </div>
  );
}
