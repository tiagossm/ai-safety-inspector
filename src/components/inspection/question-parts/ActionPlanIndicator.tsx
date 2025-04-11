
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ActionPlanIndicatorProps {
  responseValue: any;
  question: any;
  onClick: () => void;
  hasActionPlan: boolean;
}

export function ActionPlanIndicator({
  responseValue,
  question,
  onClick,
  hasActionPlan
}: ActionPlanIndicatorProps) {
  // Determine if an action plan should be suggested based on the response
  const shouldSuggestActionPlan = () => {
    if (question.responseType === "sim/não" && responseValue === "Não") {
      return true;
    }
    
    if (question.responseType === "múltipla escolha" && 
        question.options && 
        (responseValue === "Não conformidade" || 
         responseValue === "Não atende" || 
         responseValue === "Inadequado")) {
      return true;
    }
    
    return false;
  };

  const getActionPlanMessage = () => {
    if (hasActionPlan) {
      return "Plano de ação registrado";
    }
    
    if (question.responseType === "sim/não") {
      return "Resposta negativa - Um plano de ação é recomendado";
    }
    
    return "Não conformidade detectada - Um plano de ação é recomendado";
  };
  
  const needsActionPlan = shouldSuggestActionPlan();
  
  if (!responseValue || !needsActionPlan) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            variant={hasActionPlan ? "outline" : "secondary"}
            size="sm"
            className={`mt-2 flex items-center gap-1.5 text-xs h-7 ${
              hasActionPlan 
                ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100" 
                : "bg-amber-100 text-amber-800 hover:bg-amber-200"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{getActionPlanMessage()}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            {hasActionPlan 
              ? "Clique para editar o plano de ação existente" 
              : "Clique para adicionar um plano de ação para esta não conformidade"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
