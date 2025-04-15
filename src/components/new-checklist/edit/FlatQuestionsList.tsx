
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { QuestionItem } from "@/components/new-checklist/question-editor/QuestionItem";

interface FlatQuestionsListProps {
  questions: ChecklistQuestion[];
  onUpdateQuestion: (question: ChecklistQuestion) => void;
  onDeleteQuestion: (questionId: string) => void;
  enableAllMedia?: boolean;
  isSubmitting?: boolean;
}

export function FlatQuestionsList({
  questions,
  onUpdateQuestion,
  onDeleteQuestion,
  enableAllMedia = false,
  isSubmitting = false
}: FlatQuestionsListProps) {
  return (
    <div className="space-y-4">
      {questions.length === 0 ? (
        <div className="text-center py-10 border rounded-md bg-slate-50">
          <p className="text-muted-foreground mb-4">
            Este checklist ainda não possui perguntas
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {questions.map((question) => (
              <div key={question.id} className="relative">
                {question.displayNumber && (
                  <span className="absolute left-0 top-3 w-8 h-8 flex items-center justify-center text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                    {question.displayNumber}
                  </span>
                )}
                <div className={question.displayNumber ? "pl-10" : undefined}>
                  <QuestionItem
                    question={question}
                    onUpdate={onUpdateQuestion}
                    onDelete={onDeleteQuestion}
                    enableAllMedia={enableAllMedia}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
