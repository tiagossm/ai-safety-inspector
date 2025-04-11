
import React from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, ClipboardList } from "lucide-react";

interface QuestionActionsProps {
  response: any;
  onOpenCommentDialog: () => void;
  onOpenActionPlanDialog: () => void;
  setIsActionPlanOpen: (isOpen: boolean) => void;
}

export function QuestionActions({
  response,
  onOpenCommentDialog,
  onOpenActionPlanDialog,
  setIsActionPlanOpen
}: QuestionActionsProps) {
  return (
    <div className="flex flex-wrap justify-end gap-2 mt-3">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs"
        onClick={onOpenCommentDialog}
      >
        <MessageSquare className="h-3.5 w-3.5 mr-1" />
        {response?.comment ? "Editar comentário" : "Adicionar comentário"}
      </Button>
      
      {response?.value === "Não" && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-amber-600"
          onClick={() => {
            setIsActionPlanOpen(true);
            onOpenActionPlanDialog();
          }}
        >
          <ClipboardList className="h-3.5 w-3.5 mr-1" />
          {response?.actionPlan ? "Editar plano de ação" : "Adicionar plano de ação"}
        </Button>
      )}
    </div>
  );
}
