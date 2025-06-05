
import React, { useState } from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { QuestionHeader } from "./QuestionHeader";
import { QuestionContent } from "./QuestionContent";
import { QuestionActions } from "./QuestionActions";
import { ConditionalQuestionEditor } from "./ConditionalQuestionEditor";
import { SubQuestionManager } from "./SubQuestionManager";
import { QuestionValidation } from "./QuestionValidation";
import { generateQuestionNumber, getQuestionDepth } from "@/utils/questionNumbering";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

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
  showAdvancedFeatures?: boolean;
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
  dragHandleProps,
  showAdvancedFeatures = true
}: QuestionEditorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const questionNumber = generateQuestionNumber(question, questions, groupIndex);
  const depth = getQuestionDepth(question, questions);
  const maxDepthReached = depth >= 2;

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
      {/* Header da pergunta */}
      <QuestionHeader 
        question={question}
        questionNumber={questionNumber}
        depth={depth}
        onUpdate={handleQuestionUpdate}
        isSubQuestion={isSubQuestion}
        onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
        showAdvanced={showAdvanced}
      />
      
      {/* Conteúdo principal da pergunta */}
      <QuestionContent 
        question={question}
        onUpdate={handleQuestionUpdate}
        enableAllMedia={enableAllMedia}
      />

      {/* Validação da pergunta */}
      <div className="px-4">
        <QuestionValidation 
          question={question}
          allQuestions={questions}
        />
      </div>

      {/* Funcionalidades avançadas */}
      {showAdvancedFeatures && (
        <Collapsible open={showAdvanced}>
          <CollapsibleContent>
            <div className="p-4 space-y-4 border-t bg-gray-50">
              {/* Editor de perguntas condicionais */}
              <ConditionalQuestionEditor
                question={question}
                availableQuestions={questions}
                onUpdate={handleQuestionUpdate}
              />

              {/* Gerenciador de sub-perguntas */}
              {onAddSubQuestion && (
                <SubQuestionManager
                  parentQuestion={question}
                  allQuestions={questions}
                  onUpdateQuestion={handleQuestionUpdate}
                  onDeleteQuestion={onDelete}
                  onAddSubQuestion={onAddSubQuestion}
                  maxDepth={3}
                />
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
      
      {/* Actions da pergunta */}
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
