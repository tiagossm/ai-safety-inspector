
import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

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
  const options = question.options || question.opcoes || [];
  
  if (!Array.isArray(options) || options.length === 0) {
    return (
      <div className="text-xs text-red-600">
        Nenhuma opção configurada para esta pergunta.
      </div>
    );
  }

  const currentValue = Array.isArray(value) ? value : (value ? [value] : []);

  const handleSingleSelect = (option: string) => {
    if (readOnly) return;
    onChange(option);
  };

  const handleMultipleSelect = (option: string, checked: boolean) => {
    if (readOnly) return;
    
    let newValue = [...currentValue];
    if (checked) {
      if (!newValue.includes(option)) {
        newValue.push(option);
      }
    } else {
      newValue = newValue.filter(v => v !== option);
    }
    onChange(newValue);
  };

  if (allowMultiple) {
    return (
      <div className="space-y-2">
        {options.map((option: string, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <Checkbox
              id={`option-${index}`}
              checked={currentValue.includes(option)}
              onCheckedChange={(checked) => handleMultipleSelect(option, checked as boolean)}
              disabled={readOnly}
            />
            <label htmlFor={`option-${index}`} className="text-sm">
              {option}
            </label>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option: string, index: number) => (
        <Button
          key={index}
          type="button"
          size="sm"
          variant={value === option ? "default" : "outline"}
          onClick={() => handleSingleSelect(option)}
          disabled={readOnly}
        >
          {option}
        </Button>
      ))}
    </div>
  );
}
