import React from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface CheckboxesResponseInputProps {
  question: {
    options: string[];
  };
  response: {
    value: string[];
  };
  onResponseChange: (response: { value: string[] }) => void;
  readOnly?: boolean;
}

export function CheckboxesResponseInput({ 
  question, 
  response, 
  onResponseChange, 
  readOnly = false 
}: CheckboxesResponseInputProps) {
  const options = question.options || [];
  const value = Array.isArray(response?.value) ? response.value : [];

  const handleChange = (option: string, checked: boolean) => {
    let newValue = [...value];
    if (checked) {
      newValue.push(option);
    } else {
      newValue = newValue.filter((v) => v !== option);
    }
    onResponseChange({ ...response, value: newValue });
  };

  return (
    <div className="flex flex-col gap-2">
      {options.length === 0 && (
        <div className="text-xs text-red-600">Nenhuma opção configurada.</div>
      )}
      {options.map((option, idx) => (
        <label key={idx} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value.includes(option)}
            onChange={e => handleChange(option, e.target.checked)}
            disabled={readOnly}
          />
          {option}
        </label>
      ))}
    </div>
  );
}
