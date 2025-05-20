
import React, { useState } from "react";
import { ActionPlan5W2HDialog } from "@/components/action-plans/ActionPlan5W2HDialog";
import { ParsedActionPlan } from "@/utils/aiSuggestionParser";

interface ActionPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionId?: string;
  inspectionId?: string;
  existingPlan?: any;
  onSave: (data: any) => Promise<void>;
  aiSuggestion?: string;
  parsedAiSuggestion?: ParsedActionPlan;
}

export function ActionPlanDialog({
  open,
  onOpenChange,
  questionId,
  inspectionId,
  existingPlan,
  onSave,
  aiSuggestion,
  parsedAiSuggestion
}: ActionPlanDialogProps) {
  return (
    <ActionPlan5W2HDialog 
      open={open}
      onOpenChange={onOpenChange}
      questionId={questionId}
      inspectionId={inspectionId}
      existingPlan={existingPlan}
      onSave={onSave}
      aiSuggestion={aiSuggestion}
      parsedAiSuggestion={parsedAiSuggestion}
    />
  );
}
