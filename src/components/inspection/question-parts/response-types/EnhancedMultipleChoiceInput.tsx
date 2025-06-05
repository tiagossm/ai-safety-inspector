
import React, { useCallback } from "react";
import { MultipleChoiceRenderer } from "@/components/new-checklist/question-editor/MultipleChoiceRenderer";
import { ChecklistItemOption, MultipleChoiceResponse } from "@/types/multipleChoice";

interface EnhancedMultipleChoiceInputProps {
  question: any;
  value?: any;
  onChange: (value: any) => void;
  readOnly?: boolean;
}

export function EnhancedMultipleChoiceInput({
  question,
  value,
  onChange,
  readOnly = false
}: EnhancedMultipleChoiceInputProps) {
  // Converter opções antigas para o novo formato se necessário
  const convertOptions = useCallback(() => {
    if (!question.options || !Array.isArray(question.options)) {
      return [];
    }

    return question.options.map((option: any, index: number): ChecklistItemOption => {
      if (typeof option === 'string') {
        return {
          id: `option-${index}`,
          item_id: question.id,
          option_text: option,
          option_value: option,
          sort_order: index,
          score: 0,
          is_correct: false,
        };
      }
      
      return option as ChecklistItemOption;
    });
  }, [question.options, question.id]);

  const handleChange = useCallback((response: MultipleChoiceResponse) => {
    // Converter de volta para o formato esperado pelo sistema
    onChange({
      value: response.selectedOptions.length === 1 
        ? response.selectedOptions[0] 
        : response.selectedOptions,
      multipleChoiceData: response
    });
  }, [onChange]);

  // Converter valor atual para o formato MultipleChoiceResponse
  const currentResponse: MultipleChoiceResponse = {
    selectedOptions: Array.isArray(value?.value) 
      ? value.value 
      : value?.value ? [value.value] : [],
    score: value?.multipleChoiceData?.score,
    isCorrect: value?.multipleChoiceData?.isCorrect
  };

  const options = convertOptions();
  const hasScoring = options.some(opt => opt.score !== undefined && opt.score > 0);
  const showCorrectAnswer = options.some(opt => opt.is_correct === true);
  const allowsMultiple = question.responseType === 'checkboxes';

  // Determinar variante baseada no tipo de resposta
  let variant: 'buttons' | 'dropdown' | 'checkboxes' = 'buttons';
  if (question.responseType === 'dropdown') {
    variant = 'dropdown';
  } else if (question.responseType === 'checkboxes') {
    variant = 'checkboxes';
  }

  return (
    <div className="space-y-2">
      <MultipleChoiceRenderer
        options={options}
        value={currentResponse}
        onChange={handleChange}
        allowsMultiple={allowsMultiple}
        hasScoring={hasScoring}
        showCorrectAnswer={showCorrectAnswer}
        readOnly={readOnly}
        variant={variant}
      />
      
      {/* Mostrar feedback de pontuação/validação */}
      {(hasScoring || showCorrectAnswer) && currentResponse.selectedOptions.length > 0 && (
        <div className="mt-3 p-3 bg-muted rounded-md">
          {hasScoring && currentResponse.score !== undefined && (
            <div className="text-sm text-muted-foreground">
              Pontuação: <span className="font-semibold">{currentResponse.score} pontos</span>
            </div>
          )}
          {showCorrectAnswer && currentResponse.isCorrect !== undefined && (
            <div className={`text-sm font-semibold ${
              currentResponse.isCorrect ? 'text-green-600' : 'text-red-600'
            }`}>
              {currentResponse.isCorrect ? '✓ Resposta correta' : '✗ Resposta incorreta'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
