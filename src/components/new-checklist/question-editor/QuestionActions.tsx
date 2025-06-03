
import React from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Button } from "@/components/ui/button";
import { Trash2, Copy } from "lucide-react";
import { SubChecklistButton } from "./SubChecklistButton";
import { toast } from "sonner";

interface QuestionActionsProps {
  question: ChecklistQuestion;
  onUpdate: (question: ChecklistQuestion) => void;
  onDelete: (id: string) => void;
  isSubQuestion?: boolean;
}

export function QuestionActions({ 
  question, 
  onUpdate, 
  onDelete, 
  isSubQuestion 
}: QuestionActionsProps) {
  const handleDelete = () => {
    onDelete(question.id);
    toast.success("Pergunta excluída");
  };

  return (
    <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-gray-700"
        >
          <Copy className="h-4 w-4 mr-2" />
          Duplicar
        </Button>
      </div>

      <div className="flex gap-2">
        {!isSubQuestion && (
          <SubChecklistButton
            parentQuestionId={question.id}
            hasSubChecklist={question.hasSubChecklist || false}
            subChecklistId={question.subChecklistId}
            onSubChecklistCreated={(subChecklistId) => {
              onUpdate({
                ...question,
                hasSubChecklist: true,
                subChecklistId
              });
              toast.success("Subitems adicionados com sucesso");
            }}
          />
        )}
      </div>
    </div>
  );
}
