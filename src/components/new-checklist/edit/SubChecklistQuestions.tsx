
import React from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { QuestionEditor } from "./QuestionEditor";

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
  // Filtrar perguntas que pertencem ao sub-checklist
  const subQuestions = questions
    .filter(q => q.parentQuestionId === parentId)
    .sort((a, b) => a.order - b.order);
  
  if (subQuestions.length === 0) {
    return null;
  }
  
  return (
    <div className="ml-6 mt-2 border-l-2 border-gray-200 pl-4 space-y-3">
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
            onUpdate={onUpdateQuestion}
          />
        </div>
      ))}
    </div>
  );
}
