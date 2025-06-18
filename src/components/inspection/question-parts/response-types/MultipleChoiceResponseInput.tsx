
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface MultipleChoiceResponseInputProps {
  question: any;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
  readOnly?: boolean;
  allowMultiple?: boolean;
}

export function MultipleChoiceResponseInput({
  question,
  value,
  onChange,
  readOnly = false,
  allowMultiple = false
}: MultipleChoiceResponseInputProps) {
  // Buscar opções de diferentes campos possíveis
  const options = question.opcoes || question.options || [];
  
  // Parse das opções se for string JSON
  let parsedOptions = options;
  if (typeof options === 'string') {
    try {
      parsedOptions = JSON.parse(options);
    } catch (e) {
      console.warn('Erro ao fazer parse das opções:', e);
      parsedOptions = [];
    }
  }

  // Garantir que seja um array
  if (!Array.isArray(parsedOptions)) {
    parsedOptions = [];
  }

  // Normalizar opções para formato padrão
  const normalizedOptions = parsedOptions.map((option: any, index: number) => {
    if (typeof option === 'string') {
      return { label: option, value: option };
    }
    if (typeof option === 'object' && option !== null) {
      return {
        label: option.label || option.text || option.option_text || `Opção ${index + 1}`,
        value: option.value || option.option_value || option.label || option.text || option.option_text
      };
    }
    return { label: `Opção ${index + 1}`, value: `option_${index}` };
  });

  if (normalizedOptions.length === 0) {
    return (
      <div className="text-xs text-red-600 p-2 border border-red-200 bg-red-50 rounded">
        Nenhuma opção configurada para esta pergunta de múltipla escolha.
      </div>
    );
  }

  const currentValue = Array.isArray(value) ? value : (value ? [value] : []);

  const handleSingleSelect = (optionValue: string) => {
    if (readOnly) return;
    onChange(optionValue);
  };

  const handleMultipleSelect = (optionValue: string, checked: boolean) => {
    if (readOnly) return;
    
    let newValue = [...currentValue];
    if (checked) {
      if (!newValue.includes(optionValue)) {
        newValue.push(optionValue);
      }
    } else {
      newValue = newValue.filter(v => v !== optionValue);
    }
    onChange(newValue);
  };

  if (allowMultiple) {
    return (
      <div className="space-y-2">
        {normalizedOptions.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`option-${index}`}
              checked={currentValue.includes(option.value)}
              onChange={(e) => handleMultipleSelect(option.value, e.target.checked)}
              disabled={readOnly}
              className="rounded border border-gray-300"
            />
            <Label htmlFor={`option-${index}`} className="text-sm cursor-pointer">
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    );
  }

  // Single choice - usar radio buttons
  return (
    <div className="space-y-2">
      {normalizedOptions.map((option, index) => (
        <div key={index} className="flex items-center space-x-2">
          <input
            type="radio"
            id={`option-${index}`}
            name={`question-${question.id}`}
            value={option.value}
            checked={value === option.value}
            onChange={() => handleSingleSelect(option.value)}
            disabled={readOnly}
            className="rounded border border-gray-300"
          />
          <Label htmlFor={`option-${index}`} className="text-sm cursor-pointer">
            {option.label}
          </Label>
        </div>
      ))}
    </div>
  );
}
