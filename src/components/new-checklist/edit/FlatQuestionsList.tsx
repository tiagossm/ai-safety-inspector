
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Draggable } from "react-beautiful-dnd";
import { ChecklistQuestion } from "@/types/newChecklist";
import { QuestionEditor } from "./QuestionEditor";

interface FlatQuestionsListProps {
  questions: ChecklistQuestion[];
  onAddQuestion: () => void;
  onUpdateQuestion: (question: ChecklistQuestion) => void;
  onDeleteQuestion: (questionId: string) => void;
  enableAllMedia?: boolean;
}

export function FlatQuestionsList({
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  enableAllMedia = false
}: FlatQuestionsListProps) {
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
      {questions.map((question, index) => {
        // Determinar classe de indentação baseada no displayNumber
        let indentClass = "";
        if (question.displayNumber && question.displayNumber.includes(".")) {
          // Calcular o nível de indentação baseado no número de pontos
          const indentLevel = (question.displayNumber.match(/\./g) || []).length;
          indentClass = `ml-${indentLevel * 6}`;
        }
        
        // Determinar se é uma sub-pergunta para display visual
        const isSubQuestion = question.parentQuestionId !== undefined;
        
        return (
          <div 
            key={question.id} 
            className={`${indentClass} ${isSubQuestion ? "border-l-2 border-l-blue-200 pl-3" : ""}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold min-w-8">
                {question.displayNumber || index + 1}.
              </span>
            </div>
            <QuestionEditor
              question={question}
              onUpdate={onUpdateQuestion}
              onDelete={onDeleteQuestion}
              isSubQuestion={isSubQuestion}
              enableAllMedia={enableAllMedia}
            />
          </div>
        );
      })}
      
      <Button
        type="button"
        variant="outline"
        onClick={onAddQuestion}
        className="w-full mt-4"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Pergunta
      </Button>
    </div>
  );
}
