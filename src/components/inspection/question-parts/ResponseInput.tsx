import React, { useCallback } from 'react';
import { YesNoResponseInput } from './response-types/YesNoResponseInput';
import { TextResponseInput } from './response-types/TextResponseInput';
import { NumberResponseInput } from './response-types/NumberResponseInput';

interface ResponseInputProps {
  question: any;
  value?: any;
  onChange: (value: any) => void;
}

export function ResponseInput({ question, value, onChange }: ResponseInputProps) {
  const responseType = question.responseType || 'yes_no';

  // Se não vier objeto, constrói o padrão
  const responseObject = typeof value === 'object'
    ? value
    : { value: value, mediaUrls: [] };

  // Função para salvar o plano de ação
  const handleSaveActionPlan = useCallback(async (data: any) => {
    console.log("[ResponseInput] Salvando plano de ação:", data);
    // Implemente aqui a lógica real, se necessário.
  }, []);

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
          onSaveActionPlan={handleSaveActionPlan} // <- Aqui está a chave!
        />
      );
    case "text":
      return (
        <TextResponseInput
          question={question}
          response={responseObject}
          onResponseChange={handleValueChange}
        />
      );
    case "number":
      return (
        <NumberResponseInput
          value={responseObject.value}
          onChange={(numberValue) => handleValueChange({
            ...responseObject,
            value: numberValue
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
