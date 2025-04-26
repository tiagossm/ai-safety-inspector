
import React from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, ClipboardList } from "lucide-react";

interface ResponseActionsProps {
  isCommentOpen: boolean;
  setIsCommentOpen: (isOpen: boolean) => void;
  isActionPlanOpen: boolean;
  setIsActionPlanOpen: (isOpen: boolean) => void;
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
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant="ghost"
        size="sm"
        className={`text-xs flex items-center ${
          isCommentOpen ? "bg-slate-100" : ""
        }`}
        onClick={() => setIsCommentOpen(!isCommentOpen)}
      >
        <MessageSquare className="h-3.5 w-3.5 mr-1" />
        {isCommentOpen ? "Ocultar comentário" : "Adicionar comentário"}
      </Button>
      
      {hasNegativeResponse && (
        <Button
          variant="ghost"
          size="sm"
          className={`text-xs flex items-center text-red-600 hover:text-red-700 hover:bg-red-50 ${
            isActionPlanOpen ? "bg-red-50" : ""
          }`}
          onClick={() => setIsActionPlanOpen(!isActionPlanOpen)}
        >
          <ClipboardList className="h-3.5 w-3.5 mr-1" />
          {isActionPlanOpen ? "Ocultar plano de ação" : "Adicionar plano de ação"}
        </Button>
      )}
    </div>
  );
}
