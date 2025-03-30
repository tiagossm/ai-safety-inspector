
import React, { useState, useEffect } from "react";
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
  // State to track expanded sub-checklists
  const [expandedSubChecklists, setExpandedSubChecklists] = useState<Record<string, boolean>>({});
  
  // Helper function to toggle sub-checklist expanded state
  const toggleSubChecklist = (questionId: string) => {
    setExpandedSubChecklists(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // Helper function to render an individual question with its sub-checklist if needed
  const renderQuestionWithSubChecklist = (question: any, index: number, parentLabel: string = '') => {
    // Check if the question has a sub-checklist
    const hasSubChecklist = !!subChecklists[question.id];
    const isExpanded = expandedSubChecklists[question.id];
    
    // Generate the question number label
    const numberLabel = parentLabel ? `${parentLabel}${index + 1})` : `${index + 1})`;
    
    // Initialize the components array with the main question
    const components = [
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
        numberLabel={numberLabel}
        onOpenSubChecklist={
          hasSubChecklist ? 
            () => {
              toggleSubChecklist(question.id);
            } : 
            undefined
        }
      />
    ];
    
    // If this question has a sub-checklist and it's expanded, render its questions
    if (hasSubChecklist && isExpanded && subChecklists[question.id]) {
      const subChecklist = subChecklists[question.id];
      const subChecklistQuestions = subChecklist.questions || [];
      
      // Get the sub-checklist responses or initialize an empty object
      const subChecklistResponses = (responses[question.id]?.subChecklistResponses) || {};
      
      // Render each sub-checklist question with proper numbering
      subChecklistQuestions.forEach((subQuestion: any, subIndex: number) => {
        components.push(
          <InspectionQuestion
            key={`${question.id}-sub-${subQuestion.id || subIndex}`}
            question={subQuestion}
            index={subIndex}
            response={subChecklistResponses[subQuestion.id] || {}}
            onResponseChange={(data) => {
              // Update the parent question's subChecklistResponses
              const currentResponses = responses[question.id]?.subChecklistResponses || {};
              onResponseChange(question.id, {
                ...(responses[question.id] || {}),
                subChecklistResponses: {
                  ...currentResponses,
                  [subQuestion.id]: data
                }
              });
            }}
            allQuestions={subChecklistQuestions}
            numberLabel={`${numberLabel}${subIndex + 1})`}
            isSubQuestion={true}
          />
        );
      });
    }
    
    return components;
  };

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
      {questions.map((question, index) => (
        <React.Fragment key={question.id}>
          {renderQuestionWithSubChecklist(question, index)}
        </React.Fragment>
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
