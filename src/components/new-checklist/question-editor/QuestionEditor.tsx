
import React from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { QuestionHeader } from "./QuestionHeader";
import { QuestionContent } from "./QuestionContent";
import { QuestionActions } from "./QuestionActions";
import { generateQuestionNumber, getQuestionDepth } from "@/utils/questionNumbering";

interface QuestionEditorProps {
  question: ChecklistQuestion;
  questions?: ChecklistQuestion[];
  groupIndex?: number;
  onUpdate: (question: ChecklistQuestion) => void;
  onDelete: (id: string) => void;
  onAddSubQuestion?: (parentId: string) => void;
  isSubQuestion?: boolean;
  enableAllMedia?: boolean;
  dragHandleProps?: any;
}

export function QuestionEditor({
  question,
  questions = [],
  groupIndex = 0,
  onUpdate,
  onDelete,
  onAddSubQuestion,
  isSubQuestion = false,
  enableAllMedia = false,
  dragHandleProps
}: QuestionEditorProps) {
  const questionNumber = generateQuestionNumber(question, questions, groupIndex);
  const depth = getQuestionDepth(question, questions);
  const maxDepthReached = depth >= 2; // Limite de 3 níveis (0, 1, 2)

  // Função para garantir que as atualizações sejam propagadas corretamente
  const handleQuestionUpdate = (updatedQuestion: ChecklistQuestion) => {
    console.log("QuestionEditor: Atualizando pergunta", {
      id: question.id,
      number: questionNumber,
      depth: depth,
      updatedFields: Object.keys(updatedQuestion).filter(
        key => updatedQuestion[key as keyof ChecklistQuestion] !== question[key as keyof ChecklistQuestion]
      )
    });
    
    onUpdate(updatedQuestion);
  };

  const handleAddSubQuestion = () => {
    if (onAddSubQuestion && !maxDepthReached) {
      onAddSubQuestion(question.id);
    }
  };

  return (
    <div className={`border rounded-lg ${
      isSubQuestion 
        ? 'bg-gray-50 border-gray-200 ml-4' 
        : 'bg-white border-gray-300'
    } overflow-hidden`}>
      <QuestionHeader 
        question={question}
        questionNumber={questionNumber}
        depth={depth}
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
        onAddSubQuestion={handleAddSubQuestion}
        isSubQuestion={isSubQuestion}
        canAddSubQuestion={!maxDepthReached}
      />
    </div>
  );
}
