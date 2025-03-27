
import React from "react";
import { InspectionQuestion } from "../InspectionQuestion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <InspectionQuestion
          key={question.id}
          question={{
            ...question,
            hasSubChecklist: !!subChecklists[question.id]
          }}
          index={index}
          response={responses[question.id] || {}}
          onResponseChange={(data) => onResponseChange(question.id, data)}
          allQuestions={allQuestions}
          onOpenSubChecklist={
            question.hasSubChecklist && onOpenSubChecklist 
              ? () => onOpenSubChecklist(question.id) 
              : undefined
          }
        />
      ))}
      
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
