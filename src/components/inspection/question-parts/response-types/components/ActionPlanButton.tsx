
import React from "react";
import { Button } from "@/components/ui/button";
import { ClipboardEdit } from "lucide-react";

export interface ActionPlanButtonProps {
  onActionPlanClick?: () => void;
  readOnly?: boolean;
  localValue?: any;
  isActionPlanOpen?: boolean;
  setIsActionPlanOpen?: (isOpen: boolean) => void;
}

export function ActionPlanButton({
  onActionPlanClick,
  readOnly = false,
  localValue,
  isActionPlanOpen,
  setIsActionPlanOpen
}: ActionPlanButtonProps) {
  
  // Handle click baseado nas props disponíveis
  const handleClick = () => {
    if (setIsActionPlanOpen) {
      setIsActionPlanOpen(!isActionPlanOpen);
    } else if (onActionPlanClick) {
      onActionPlanClick();
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 text-amber-600 border-amber-300"
      onClick={handleClick}
      disabled={readOnly}
    >
      <ClipboardEdit className="w-4 h-4" />
      <span>Plano de Ação</span>
    </Button>
  );
}
