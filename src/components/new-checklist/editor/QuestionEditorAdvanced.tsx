
import React from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { MediaCard } from "./MediaCard";
import { SubQuestionsCard } from "./SubQuestionsCard";

interface QuestionEditorAdvancedProps {
  question: ChecklistQuestion;
  showAdvanced: boolean;
  allQuestions: ChecklistQuestion[];
  onUpdate: (question: ChecklistQuestion) => void;
  onDelete: (questionId: string) => void;
  onAddSubQuestion?: (parentId: string) => void;
}

export function QuestionEditorAdvanced({
  question,
  showAdvanced,
  allQuestions,
  onUpdate,
  onDelete,
  onAddSubQuestion
}: QuestionEditorAdvancedProps) {
  return (
    <Collapsible open={showAdvanced}>
      <CollapsibleContent className="space-y-4">
        {/* Configurações de mídia */}
        <MediaCard
          question={question}
          onUpdate={(updates) => onUpdate({ ...question, ...updates })}
        />

        {/* Subperguntas */}
        {onAddSubQuestion && (
          <SubQuestionsCard
            question={question}
            allQuestions={allQuestions}
            onUpdateQuestion={onUpdate}
            onDeleteQuestion={onDelete}
            onAddSubQuestion={onAddSubQuestion}
          />
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
