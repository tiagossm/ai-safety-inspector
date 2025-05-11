
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ActionPlanButtonProps {
  localValue: boolean | undefined;
  onActionPlanClick: () => void;
  readOnly: boolean;
}

export function ActionPlanButton({ localValue, onActionPlanClick, readOnly }: ActionPlanButtonProps) {
  if (localValue !== false) return null;
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onActionPlanClick}
      disabled={readOnly}
      className="mb-3 bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
      type="button"
    >
      <AlertCircle className="h-3.5 w-3.5 mr-1" />
      Criar Plano de Ação
    </Button>
  );
}
