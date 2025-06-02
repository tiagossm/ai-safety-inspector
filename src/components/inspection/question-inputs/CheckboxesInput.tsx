
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface CheckboxesInputProps {
  options: string[];
  value: string[] | undefined;
  onChange: (value: string[]) => void;
  readOnly?: boolean;
}

export function CheckboxesInput({ 
  options, 
  value = [], 
  onChange, 
  readOnly = false 
}: CheckboxesInputProps) {
  const handleCheckboxChange = (option: string, checked: boolean) => {
    if (readOnly) return;
    
    const currentValue = Array.isArray(value) ? value : [];
    
    if (checked) {
      if (!currentValue.includes(option)) {
        onChange([...currentValue, option]);
      }
    } else {
      onChange(currentValue.filter(item => item !== option));
    }
  };

  if (!options || options.length === 0) {
    return (
      <div className="text-sm text-gray-500 p-2 border border-yellow-200 bg-yellow-50 rounded">
        Nenhuma opção configurada para esta pergunta
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-3">
      {options.map((option, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Checkbox
            id={`checkbox-${index}`}
            checked={Array.isArray(value) && value.includes(option)}
            onCheckedChange={(checked) => handleCheckboxChange(option, checked as boolean)}
            disabled={readOnly}
          />
          <Label 
            htmlFor={`checkbox-${index}`} 
            className="text-sm cursor-pointer flex-1"
          >
            {option}
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
