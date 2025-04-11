
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Lightbulb } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ActionPlanSectionProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  actionPlan: string | undefined;
  onActionPlanChange: (text: string) => void;
  onOpenDialog?: () => void;
  hasNegativeResponse: boolean;
}

export function ActionPlanSection({ 
  isOpen, 
  onOpenChange, 
  actionPlan, 
  onActionPlanChange,
  onOpenDialog,
  hasNegativeResponse
}: ActionPlanSectionProps) {
  return (
    <Collapsible
      open={isOpen || !!actionPlan}
      onOpenChange={onOpenChange}
      className="mt-2.5"
    >
      <CollapsibleTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1.5 w-full justify-start bg-amber-50 border-amber-200 text-amber-700 text-xs h-7"
        >
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
          <span>{actionPlan ? "Plano de Ação" : "Adicionar Plano de Ação"}</span>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <div className="bg-amber-50 p-2.5 rounded-md border border-amber-200">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
            <h4 className="text-xs font-medium text-amber-700">Plano de Ação</h4>
          </div>
          <Textarea
            value={actionPlan || ""}
            onChange={(e) => onActionPlanChange(e.target.value)}
            placeholder="Descreva o plano de ação para resolver este problema..."
            rows={2}
            className="bg-white text-xs"
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
