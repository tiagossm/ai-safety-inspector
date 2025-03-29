
import React from "react";
import { InspectionQuestion } from "../InspectionQuestion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

interface QuestionsListProps {
  questions: any[];
  responses: Record<string, any>;
  allQuestions: any[];
  onResponseChange: (questionId: string, data: any) => void;
  onOpenSubChecklist?: (questionId: string) => void;
  subChecklists: Record<string, any>;
}

export function QuestionsList({
  questions,
  responses,
  allQuestions,
  onResponseChange,
  onOpenSubChecklist,
  subChecklists
}: QuestionsListProps) {
  if (!questions || questions.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="flex flex-col items-center gap-2">
          <AlertCircle className="h-10 w-10 text-muted-foreground opacity-40" />
          <p className="text-muted-foreground">Nenhuma pergunta disponível neste grupo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question, index) => {
        // Check if the question has a sub-checklist
        const hasSubChecklist = !!subChecklists[question.id];
        
        return (
          <InspectionQuestion
            key={question.id}
            question={{
              ...question,
              hasSubChecklist
            }}
            index={index}
            response={responses[question.id] || {}}
            onResponseChange={(data) => onResponseChange(question.id, data)}
            allQuestions={allQuestions}
            onOpenSubChecklist={
              hasSubChecklist && onOpenSubChecklist 
                ? () => onOpenSubChecklist(question.id) 
                : undefined
            }
          />
        );
      })}
      
      <div className="pt-4 flex justify-end">
        <Button
          variant="ghost"
          onClick={() => {
            toast.info("Próximo grupo será implementado em versões futuras");
          }}
        >
          Próximo Grupo
        </Button>
      </div>
    </div>
  );
}
