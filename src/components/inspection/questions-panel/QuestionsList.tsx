
import React, { useState, useEffect } from "react";
import { InspectionQuestion } from "../InspectionQuestion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertCircle, ChevronDown, ChevronRight } from "lucide-react";

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
  
  useEffect(() => {
    // Log the questions and available subChecklists for debugging
    console.log(`QuestionsList: Rendering ${questions?.length || 0} questions`);
    if (Object.keys(subChecklists).length > 0) {
      console.log("Available subChecklists:", Object.keys(subChecklists));
    }
    
    // Check if all questions have groupId
    const questionsWithoutGroup = questions?.filter(q => !q.groupId) || [];
    if (questionsWithoutGroup.length > 0) {
      console.warn(`Found ${questionsWithoutGroup.length} questions without groupId`);
    }
  }, [questions, subChecklists]);
  
  // Helper function to toggle sub-checklist expanded state
  const toggleSubChecklist = (questionId: string) => {
    console.log("Toggling sub-checklist for question:", questionId);
    setExpandedSubChecklists(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // Helper function to render an individual question with its sub-checklist if needed
  const renderQuestionWithSubChecklist = (question: any, index: number, parentLabel: string = '') => {
    // Check if the question has a sub-checklist
    const hasSubChecklist = !!question.subChecklistId || !!question.sub_checklist_id || !!subChecklists[question.id];
    const isExpanded = expandedSubChecklists[question.id];
    
    if (hasSubChecklist) {
      console.log(`Question ${question.id} has sub-checklist. Is expanded: ${isExpanded}`);
    }
    
    // Generate hierarchical question number label
    const numberLabel = parentLabel ? `${parentLabel}.${index + 1}` : `${index + 1}`;
    
    // Initialize the components array with the main question
    const components = [
      <div key={question.id} className="border rounded-md mb-4">
        <div className="p-4">
          <InspectionQuestion
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
          
          {hasSubChecklist && (
            <div className="mt-2 pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSubChecklist(question.id)}
                className="flex items-center text-primary"
              >
                {isExpanded ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                {isExpanded ? "Ocultar sub-checklist" : "Mostrar sub-checklist"}
              </Button>
            </div>
          )}
        </div>
        
        {/* If this question has a sub-checklist and it's expanded, render its questions */}
        {hasSubChecklist && isExpanded && subChecklists[question.id] && (
          <div className="border-t px-4 py-3 bg-muted/30">
            <div className="mb-2">
              <h4 className="font-medium text-sm">{subChecklists[question.id].title}</h4>
              <p className="text-xs text-muted-foreground">{subChecklists[question.id].description}</p>
            </div>
            <div className="space-y-3 pl-4">
              {(subChecklists[question.id].questions || []).map((subQuestion: any, subIndex: number) => {
                // Get the sub-checklist responses or initialize an empty object
                const subChecklistResponses = (responses[question.id]?.subChecklistResponses) || {};
                
                return (
                  <div className="border rounded bg-background p-3" key={`${question.id}-sub-${subQuestion.id || subIndex}`}>
                    <InspectionQuestion
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
                      allQuestions={subChecklists[question.id].questions || []}
                      numberLabel={`${numberLabel}.${subIndex + 1}`}
                      isSubQuestion={true}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    ];
    
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
