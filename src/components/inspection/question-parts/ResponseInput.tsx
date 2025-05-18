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
  
  // Construindo o objeto de resposta completo (incluindo o valor)
  const responseObject = typeof value === 'object' 
    ? value 
    : { value: value, mediaUrls: [] }; // Caso value seja primitivo, criamos um objeto completo
  
  console.log("[ResponseInput] rendering with type:", responseType, "value:", value);

  // Função de salvar plano de ação (deve ser customizada conforme seu fluxo)
  const handleSaveActionPlan = async (data: any) => {
    console.log("[ResponseInput] Salvando plano de ação:", data);
    // Aqui vai sua lógica real (dispatch, setState, chamada API, etc)
    // Por enquanto só loga pra debug.
  };
  
  const handleValueChange = useCallback((newValue: any) => {
    console.log("[ResponseInput] handleValueChange:", newValue);
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
          onSaveActionPlan={handleSaveActionPlan}  // <-- PASSA A FUNÇÃO AQUI
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
