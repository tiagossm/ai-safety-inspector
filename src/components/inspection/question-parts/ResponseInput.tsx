
import React, { useCallback } from 'react';
import { YesNoResponseInput } from './response-types/YesNoResponseInput';
import { TextResponseInput } from './response-types/TextResponseInput';
import { NumberResponseInput } from './response-types/NumberResponseInput';

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
    case "number":
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
