
import React from "react";
import { ActionPlanForm } from "@/components/action-plans/form/ActionPlanForm";
import { ActionPlan } from "@/services/inspection/actionPlanService";
import { ActionPlanFormData } from "@/components/action-plans/form/types";

interface ActionPlanFormSectionProps {
  inspectionId: string;
  questionId: string;
  actionPlan?: ActionPlan;
  onSaveActionPlan: (data: ActionPlanFormData) => Promise<ActionPlan | void>;
}

export function ActionPlanFormSection({
  inspectionId,
  questionId,
  actionPlan,
  onSaveActionPlan
}: ActionPlanFormSectionProps) {
  return (
    <ActionPlanForm
      inspectionId={inspectionId}
      questionId={questionId}
      existingPlan={actionPlan ? {
        id: actionPlan.id,
        description: actionPlan.description,
        assignee: actionPlan.assignee || '',
        dueDate: actionPlan.due_date ? new Date(actionPlan.due_date) : undefined,
        priority: actionPlan.priority,
        status: actionPlan.status
      } : undefined}
      onSave={onSaveActionPlan}
      trigger={<></>}
    />
  );
}
