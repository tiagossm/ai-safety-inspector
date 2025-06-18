
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface MultipleSelectResponseInputProps {
  question: any;
  value: string[] | undefined;
  onChange: (value: string[]) => void;
  readOnly?: boolean;
}

export function MultipleSelectResponseInput({
  question,
  value = [],
  onChange,
  readOnly = false
}: MultipleSelectResponseInputProps) {
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

  // Garantir que seja um array e converter para formato esperado
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

  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    if (readOnly) return;
    
    const currentValue = Array.isArray(value) ? value : [];
    
    if (checked) {
      if (!currentValue.includes(optionValue)) {
        onChange([...currentValue, optionValue]);
      }
    } else {
      onChange(currentValue.filter(item => item !== optionValue));
    }
  };

  if (normalizedOptions.length === 0) {
    return (
      <div className="text-xs text-red-600 p-2 border border-red-200 bg-red-50 rounded">
        Nenhuma opção configurada para esta pergunta de múltipla seleção.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {normalizedOptions.map((option, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Checkbox
            id={`multiple-select-${index}`}
            checked={Array.isArray(value) && value.includes(option.value)}
            onCheckedChange={(checked) => handleCheckboxChange(option.value, checked as boolean)}
            disabled={readOnly}
          />
          <Label 
            htmlFor={`multiple-select-${index}`} 
            className="text-sm cursor-pointer flex-1"
          >
            {option.label}
          </Label>
        </div>
      ))}
      
      {Array.isArray(value) && value.length > 0 && (
        <div className="text-xs text-gray-600 mt-2">
          {value.length} opção(ões) selecionada(s)
        </div>
      )}
    </div>
  );
}
