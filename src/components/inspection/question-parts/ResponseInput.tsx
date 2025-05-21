import React, { useCallback } from 'react';
import { YesNoResponseInput } from './response-types/YesNoResponseInput';
import { TextResponseInput } from './response-types/TextResponseInput';
import { NumberResponseInput } from './response-types/NumberResponseInput';
import { DateResponseInput } from './response-types/DateResponseInput';
import { TimeResponseInput } from './response-types/TimeResponseInput';
import { MultipleChoiceInput } from '../question-inputs/MultipleChoiceInput';

interface ResponseInputProps {
  question: any;
  value?: any;
  onChange: (value: any) => void;
  inspectionId?: string;
  actionPlan?: any;
  onSaveActionPlan?: (data: any) => Promise<void>;
}

export function ResponseInput({ 
  question, 
  value, 
  onChange,
  inspectionId,
  actionPlan,
  onSaveActionPlan
}: ResponseInputProps) {
  const responseType = question.responseType || 'yes_no';

  // Se não vier objeto, constrói o padrão
  const responseObject = typeof value === 'object'
    ? value
    : { value: value, mediaUrls: [] };

  const handleValueChange = useCallback((newValue: any) => {
    if (typeof newValue === 'object' && newValue !== null) {
      onChange(newValue);
    } else {
      onChange({
        ...responseObject,
        value: newValue
      });
    }
  }, [onChange, responseObject]);

  switch (responseType) {
    case "yes_no":
      return (
        <YesNoResponseInput
          question={question}
          response={responseObject}
          onResponseChange={handleValueChange}
          inspectionId={inspectionId}
          actionPlan={actionPlan}
          onSaveActionPlan={onSaveActionPlan}
        />
      );
    case "text":
      return (
        <TextResponseInput
          question={question}
          response={responseObject}
          onResponseChange={handleValueChange}
          inspectionId={inspectionId}
          actionPlan={actionPlan}
          onSaveActionPlan={onSaveActionPlan}
        />
      );
    case "numeric":
      return (
        <NumberResponseInput
          question={question}
          response={responseObject}
          onResponseChange={handleValueChange}
          onChange={(numberValue) => handleValueChange({
            ...responseObject,
            value: numberValue
          })}
          inspectionId={inspectionId}
          actionPlan={actionPlan}
          onSaveActionPlan={onSaveActionPlan}
        />
      );
    case "multiple_choice":
      return (
        <MultipleChoiceInput
          options={question.options || []}
          value={responseObject.value}
          onChange={(option) => handleValueChange({
            ...responseObject,
            value: option
          })}
        />
      );
    case "date":
      return (
        <DateResponseInput
          value={responseObject.value}
          onChange={(dateValue) => handleValueChange({
            ...responseObject,
            value: dateValue
          })}          const handleAddOption = () => {
            // ...existing code...
            console.log("Adicionando opção:", newOption, "Novo array:", [...currentOptions, newOption.trim()]);
          };
          const handleRemoveOption = (index: number) => {
            // ...existing code...
            console.log("Removendo opção índice:", index, "Novo array:", currentOptions);
          };          console.log("QuestionEditor: question", question);
          console.log("Tipo de resposta:", frontendResponseType);
          console.log("Opções:", question.options);
        />
      );
    case "time":
      return (
        <TimeResponseInput
          value={responseObject.value}
          onChange={(timeValue) => handleValueChange({
            ...responseObject,
            value: timeValue
          })}
        />
      );
    default:
      return (
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <p className="text-red-700">
            Tipo de resposta não suportado: {responseType}
          </p>
        </div>
      );
  }
}
