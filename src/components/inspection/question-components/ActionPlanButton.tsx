
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";

interface ActionPlanButtonProps {
  isActionPlanOpen: boolean;
  setIsActionPlanOpen: (open: boolean) => void;
}

export function ActionPlanButton({ 
  isActionPlanOpen, 
  setIsActionPlanOpen 
}: ActionPlanButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setIsActionPlanOpen(!isActionPlanOpen)}
      className="flex items-center text-xs"
    >
      {isActionPlanOpen ? 
        <ChevronDown className="h-3 w-3 mr-1" /> : 
        <ChevronRight className="h-3 w-3 mr-1" />
      }
      Plano de ação
    </Button>
  );
}
