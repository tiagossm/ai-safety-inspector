
import React from 'react';
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
  const handleClick = () => {
    if (setIsActionPlanOpen) {
      setIsActionPlanOpen(!isActionPlanOpen);
    } else if (onActionPlanClick) {
      onActionPlanClick();
    }
  };

  return (
    <Button 
      type="button"
      variant="outline" 
      size="sm"
      className="flex items-center gap-1 text-xs text-gray-700 bg-gray-50 hover:bg-gray-100"
      onClick={handleClick}
      disabled={readOnly}
    >
      <ClipboardEdit className="h-3.5 w-3.5 mr-1" />
      Plano de Ação
    </Button>
  );
}
