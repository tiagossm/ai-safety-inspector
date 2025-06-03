
import React from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { SubChecklistButton } from "./SubChecklistButton";

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
  isSubQuestion = false
}: QuestionActionsProps) {
  const handleSubChecklistCreated = (subChecklistId: string) => {
    const updatedQuestion = {
      ...question,
      hasSubChecklist: true,
      subChecklistId
    };
    onUpdate(updatedQuestion);
  };

  return (
    <div className={`flex items-center justify-between p-3 border-t ${isSubQuestion ? 'bg-gray-50' : 'bg-gray-50'}`}>
      <div className="flex items-center gap-2">
        {!isSubQuestion && (
          <SubChecklistButton
            parentQuestionId={question.id}
            hasSubChecklist={question.hasSubChecklist || false}
            subChecklistId={question.subChecklistId}
            onSubChecklistCreated={handleSubChecklistCreated}
            parentQuestion={question}
          />
        )}
      </div>
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onDelete(question.id)}
        className="text-red-600 hover:text-red-800 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Remover
      </Button>
    </div>
  );
}
