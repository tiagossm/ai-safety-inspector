
import React, { useState } from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { QuestionEditorHeader } from "./QuestionEditorHeader";
import { QuestionEditorBody } from "./QuestionEditorBody";
import { QuestionEditorAdvanced } from "./QuestionEditorAdvanced";
import { QuestionValidationAlert } from "./QuestionValidationAlert";
import { TYPES_REQUIRING_OPTIONS } from "@/types/responseTypes";

interface ImprovedQuestionEditorProps {
  question: ChecklistQuestion;
  questionIndex: number;
  onUpdate: (question: ChecklistQuestion) => void;
  onDelete: (questionId: string) => void;
  onAddSubQuestion?: (parentId: string) => void;
  allQuestions?: ChecklistQuestion[];
  isDragging?: boolean;
}

export function ImprovedQuestionEditor({
  question,
  questionIndex,
  onUpdate,
  onDelete,
  onAddSubQuestion,
  allQuestions = [],
  isDragging = false
}: ImprovedQuestionEditorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Validação da pergunta
  const validation = React.useMemo(() => {
    const hasText = question.text && question.text.trim().length > 0;
    const requiresOptions = TYPES_REQUIRING_OPTIONS.includes(question.responseType as any);
    const hasValidOptions = !requiresOptions || (question.options && question.options.length > 0);
    const hasValidWeight = question.weight > 0;
    
    return {
      isValid: hasText && hasValidOptions && hasValidWeight,
      hasText,
      hasValidOptions,
      hasValidWeight,
      requiresOptions
    };
  }, [question]);

  const handleFieldUpdate = (field: keyof ChecklistQuestion, value: any) => {
    const updatedQuestion = { ...question, [field]: value };
    onUpdate(updatedQuestion);
  };

  const handleOptionsChange = (options: string[]) => {
    handleFieldUpdate('options', options);
  };

  return (
    <Card className={`transition-all duration-200 ${
      isDragging ? 'shadow-lg border-blue-300 bg-blue-50' : 'hover:shadow-md'
    } ${validation.isValid ? 'border-green-200' : 'border-amber-200'}`}>
      <CardHeader className="pb-3">
        <QuestionEditorHeader
          question={question}
          questionIndex={questionIndex}
          isValid={validation.isValid}
          hasText={validation.hasText}
          showAdvanced={showAdvanced}
          isDragging={isDragging}
          onUpdate={handleFieldUpdate}
          onDelete={onDelete}
          onToggleAdvanced={setShowAdvanced}
        />

        <QuestionEditorBody
          question={question}
          onUpdate={handleFieldUpdate}
          onOptionsChange={handleOptionsChange}
        />
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Configurações avançadas */}
        <QuestionEditorAdvanced
          question={question}
          showAdvanced={showAdvanced}
          allQuestions={allQuestions}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onAddSubQuestion={onAddSubQuestion}
        />

        {/* Alertas de validação */}
        <QuestionValidationAlert validation={validation} />
      </CardContent>
    </Card>
  );
}
