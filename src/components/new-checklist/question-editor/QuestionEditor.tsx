
import React from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { QuestionHeader } from "./QuestionHeader";
import { QuestionContent } from "./QuestionContent";
import { QuestionActions } from "./QuestionActions";

interface QuestionEditorProps {
  question: ChecklistQuestion;
  onUpdate: (question: ChecklistQuestion) => void;
  onDelete: (id: string) => void;
  isSubQuestion?: boolean;
  enableAllMedia?: boolean;
}

export function QuestionEditor({
  question,
  onUpdate,
  onDelete,
  isSubQuestion = false,
  enableAllMedia = false
}: QuestionEditorProps) {
  return (
    <div className={`border rounded-lg ${isSubQuestion ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'} overflow-hidden`}>
      <QuestionHeader 
        question={question}
        onUpdate={onUpdate}
        isSubQuestion={isSubQuestion}
      />
      
      <QuestionContent 
        question={question}
        onUpdate={onUpdate}
        enableAllMedia={enableAllMedia}
      />
      
      <QuestionActions 
        question={question}
        onUpdate={onUpdate}
        onDelete={onDelete}
        isSubQuestion={isSubQuestion}
      />
    </div>
  );
}
