
import React from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { QuestionHeader } from "@/components/new-checklist/question-editor/QuestionHeader";
import { QuestionContent } from "@/components/new-checklist/question-editor/QuestionContent";
import { QuestionActions } from "@/components/new-checklist/question-editor/QuestionActions";

interface QuestionEditorProps {
  question: ChecklistQuestion;
  onUpdate?: (question: ChecklistQuestion) => void;
  onDelete?: (id: string) => void;
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
  const handleUpdate = (updatedQuestion: ChecklistQuestion) => {
    if (onUpdate) {
      onUpdate(updatedQuestion);
    }
  };

  const handleDelete = (id: string) => {
    if (onDelete) {
      onDelete(id);
    }
  };

  return (
    <div className={`border rounded-lg ${isSubQuestion ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'} overflow-hidden`}>
      <QuestionHeader 
        question={question}
        onUpdate={handleUpdate}
        isSubQuestion={isSubQuestion}
      />
      
      <QuestionContent 
        question={question}
        onUpdate={handleUpdate}
        enableAllMedia={enableAllMedia}
      />
      
      <QuestionActions 
        question={question}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        isSubQuestion={isSubQuestion}
      />
    </div>
  );
}
