
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
  // Função para garantir que as atualizações sejam propagadas corretamente
  const handleQuestionUpdate = (updatedQuestion: ChecklistQuestion) => {
    // Log para debug
    console.log("QuestionEditor: Atualizando pergunta", {
      id: question.id,
      updatedFields: Object.keys(updatedQuestion).filter(
        key => updatedQuestion[key as keyof ChecklistQuestion] !== question[key as keyof ChecklistQuestion]
      )
    });
    
    onUpdate(updatedQuestion);
  };

  return (
    <div className={`border rounded-lg ${isSubQuestion ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'} overflow-hidden`}>
      <QuestionHeader 
        question={question}
        onUpdate={handleQuestionUpdate}
        isSubQuestion={isSubQuestion}
      />
      
      <QuestionContent 
        question={question}
        onUpdate={handleQuestionUpdate}
        enableAllMedia={enableAllMedia}
      />
      
      <QuestionActions 
        question={question}
        onUpdate={handleQuestionUpdate}
        onDelete={onDelete}
        isSubQuestion={isSubQuestion}
      />
    </div>
  );
}
