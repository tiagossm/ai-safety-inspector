
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Camera, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface QuestionActionsProps {
  response: any;
  onOpenMediaDialog: () => void;
  onOpenCommentDialog: () => void;
  onOpenActionPlanDialog: () => void;
  setIsActionPlanOpen: (isOpen: boolean) => void;
}

export function QuestionActions({
  response,
  onOpenMediaDialog,
  onOpenCommentDialog,
  onOpenActionPlanDialog,
  setIsActionPlanOpen
}: QuestionActionsProps) {
  return (
    <div className="flex flex-wrap justify-end gap-1.5 mt-2.5">
      <Button
        variant="outline"
        size="sm"
        onClick={onOpenMediaDialog}
        className="flex items-center gap-1 text-xs h-7"
      >
        <Camera className="h-3.5 w-3.5 text-gray-500" />
        <span>Mídia</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onOpenCommentDialog}
        className="flex items-center gap-1 text-xs h-7"
      >
        <MessageCircle className="h-3.5 w-3.5 text-gray-500" />
        <span>Comentário</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          if (response?.value === "não") {
            onOpenActionPlanDialog();
          } else {
            toast.info("Planos de ação são tipicamente adicionados para respostas 'Não'");
            setIsActionPlanOpen(true);
          }
        }}
        className="flex items-center gap-1 text-xs h-7"
      >
        <AlertTriangle className="h-3.5 w-3.5 text-gray-500" />
        <span>Plano de Ação</span>
      </Button>
    </div>
  );
}
