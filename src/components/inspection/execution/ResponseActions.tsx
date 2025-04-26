
import React from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, ClipboardList } from "lucide-react";

interface ResponseActionsProps {
  isCommentOpen: boolean;
  setIsCommentOpen: (open: boolean) => void;
  isActionPlanOpen: boolean;
  setIsActionPlanOpen: (open: boolean) => void;
  hasNegativeResponse: boolean;
}

export function ResponseActions({
  isCommentOpen,
  setIsCommentOpen,
  isActionPlanOpen,
  setIsActionPlanOpen,
  hasNegativeResponse
}: ResponseActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCommentOpen(!isCommentOpen)}
        className={`text-xs ${isCommentOpen ? 'bg-muted' : ''}`}
      >
        <MessageSquare className="h-3 w-3 mr-1" />
        {isCommentOpen ? "Ocultar comentário" : "Adicionar comentário"}
      </Button>
      
      {hasNegativeResponse && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsActionPlanOpen(!isActionPlanOpen)}
          className={`text-xs ${isActionPlanOpen ? 'bg-muted' : ''}`}
        >
          <ClipboardList className="h-3 w-3 mr-1" />
          {isActionPlanOpen ? "Ocultar plano de ação" : "Adicionar plano de ação"}
        </Button>
      )}
    </div>
  );
}
