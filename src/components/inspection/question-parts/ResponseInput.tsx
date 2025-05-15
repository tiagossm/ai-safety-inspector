import React from 'react';
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
  
  const handleValueChange = (newValue: any) => {
    onChange(newValue);
  };

  console.log("[ResponseInput] rendering with type:", responseType, "value:", value);
  
  switch (responseType) {
    case "yes_no":
      return (
        <YesNoResponseInput 
          question={question} 
          response={{ value }} 
          onResponseChange={(data) => handleValueChange(data.value)} 
        />
      );
    
    case "text":
      return (
        <TextResponseInput 
          question={question} 
          response={{ value }} 
          onResponseChange={(data) => handleValueChange(data.value)} 
        />
      );
    
    case "number":
      return (
        <NumberResponseInput 
          value={value} 
          onChange={handleValueChange} 
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
