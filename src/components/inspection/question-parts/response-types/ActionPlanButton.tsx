
import React from "react";
import { Button } from "@/components/ui/button";
import { ActionPlanForm } from "@/components/action-plans/form/ActionPlanForm";

interface ActionPlanButtonProps {
  inspectionId: string;
  questionId: string;
  onSaveActionPlan: (data: any) => Promise<void>;
}

export const ActionPlanButton: React.FC<ActionPlanButtonProps> = ({
  inspectionId,
  questionId,
  onSaveActionPlan
}) => {
  return (
    <ActionPlanForm
      inspectionId={inspectionId}
      questionId={questionId}
      onSave={onSaveActionPlan}
      trigger={
        <Button variant="outline" size="sm" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
          Adicionar Plano de Ação
        </Button>
      }
    />
  );
};
