
import React, { useState } from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { QuestionEditor } from "@/components/new-checklist/question-editor/QuestionEditor";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubChecklistQuestionsProps {
  parentId: string;
  questions: ChecklistQuestion[];
  onUpdateQuestion: (question: ChecklistQuestion) => void;
  onDeleteQuestion: (questionId: string) => void;
  parentNumbering: string;
}

export function SubChecklistQuestions({
  parentId,
  questions,
  onUpdateQuestion,
  onDeleteQuestion,
  parentNumbering
}: SubChecklistQuestionsProps) {
  const [isOpen, setIsOpen] = useState(true);
  
  // Filter questions that belong to the sub-checklist
  const subQuestions = questions
    .filter(q => q.parentQuestionId === parentId)
    .sort((a, b) => a.order - b.order);
  
  if (subQuestions.length === 0) {
    return null;
  }
  
  return (
    <div className="ml-6 mt-2 border-l-2 border-gray-200 pl-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center mb-2">
          <h4 className="text-sm font-medium flex-1">Sub-perguntas ({subQuestions.length})</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent>
          <div className="space-y-3">
            {subQuestions.map((question, index) => (
              <div key={question.id} className="border rounded-md p-3 bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <span className="font-semibold text-sm bg-muted px-2 py-0.5 rounded">
                    {`${parentNumbering}.${index + 1}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDeleteQuestion(question.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remover
                  </button>
                </div>
                
                <QuestionEditor
                  question={question}
                  questions={questions}
                  onUpdate={onUpdateQuestion}
                  onDelete={onDeleteQuestion}
                  isSubQuestion={true}
                />
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
