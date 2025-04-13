
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { QuestionEditor } from "./QuestionEditor";
import { SubChecklistQuestions } from "./SubChecklistQuestions";

interface FlatQuestionsListProps {
  questions: ChecklistQuestion[];
  onAddQuestion: () => void;
  onUpdateQuestion: (question: ChecklistQuestion) => void;
  onDeleteQuestion: (questionId: string) => void;
  enableAllMedia?: boolean;
  isSubmitting?: boolean;  // Added optional isSubmitting prop
}

export function FlatQuestionsList({
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  enableAllMedia = false,
  isSubmitting = false  // Added default value
}: FlatQuestionsListProps) {
  // Group questions by their parent IDs
  const parentQuestions = questions.filter(q => !q.parentQuestionId);
  
  if (questions.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed rounded-md">
        <p className="text-muted-foreground mb-4">
          Nenhuma pergunta adicionada
        </p>
        <Button 
          variant="outline" 
          onClick={onAddQuestion}
          className="mx-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Pergunta
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {parentQuestions.map((question, index) => {
        const displayNumber = question.displayNumber || String(index + 1);
        
        return (
          <div key={question.id} className="space-y-2">
            {/* Main question */}
            <div className="flex items-start gap-2">
              <span className="font-semibold min-w-8 mt-1">
                {displayNumber}.
              </span>
              
              <div className="flex-1">
                <QuestionEditor
                  question={question}
                  onUpdate={onUpdateQuestion}
                  onDelete={onDeleteQuestion}
                  enableAllMedia={enableAllMedia}
                />
                
                {/* Sub-questions */}
                {question.hasSubChecklist && (
                  <SubChecklistQuestions
                    parentId={question.id}
                    questions={questions}
                    onUpdateQuestion={onUpdateQuestion}
                    onDeleteQuestion={onDeleteQuestion}
                    parentNumbering={displayNumber}
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
      
      <Button
        type="button"
        variant="outline"
        onClick={onAddQuestion}
        className="w-full mt-4"
        disabled={isSubmitting}  // Disable when submitting
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Pergunta
      </Button>
    </div>
  );
}
