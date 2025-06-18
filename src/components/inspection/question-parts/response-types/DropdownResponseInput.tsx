
import React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface DropdownResponseInputProps {
  question: any;
  value: string;
  onChange: (val: string) => void;
  readOnly?: boolean;
}

export function DropdownResponseInput({
  question,
  value,
  onChange,
  readOnly = false
}: DropdownResponseInputProps) {
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
        Nenhuma opção configurada para este dropdown.
      </div>
    );
  }

  return (
    <Select 
      value={value || ""} 
      onValueChange={onChange}
      disabled={readOnly}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Selecione uma opção..." />
      </SelectTrigger>
      <SelectContent className="bg-white z-50">
        {normalizedOptions.map((option, index) => (
          <SelectItem key={index} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
