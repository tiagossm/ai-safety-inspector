
import React from "react";
import { Button } from "@/components/ui/button";
import { ChecklistQuestion } from "@/types/newChecklist";
import { QuestionEditor } from "./QuestionEditor";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FlatQuestionsListProps {
  questions: ChecklistQuestion[];
  onUpdateQuestion: (question: ChecklistQuestion) => void;
  onDeleteQuestion: (id: string) => void;
  enableAllMedia: boolean;
  isSubmitting: boolean;
}

export function FlatQuestionsList({
  questions,
  onUpdateQuestion,
  onDeleteQuestion,
  enableAllMedia,
  isSubmitting
}: FlatQuestionsListProps) {
  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-sm text-muted-foreground mb-6">
          Este checklist ainda não possui perguntas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ScrollArea className="h-[calc(100vh-370px)]">
        <div className="space-y-4 pr-4">
          {questions.map((question) => (
            <QuestionEditor
              key={question.id}
              question={question}
              onUpdate={onUpdateQuestion}
              onDelete={onDeleteQuestion}
              isSubQuestion={!!question.parentQuestionId}
              enableAllMedia={enableAllMedia}
              isDisabled={isSubmitting}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
