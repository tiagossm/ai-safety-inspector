
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface CheckboxesResponseInputProps {
  options: string[];
  value: string[] | undefined;
  onChange: (value: string[]) => void;
  readOnly?: boolean;
}

export function CheckboxesResponseInput({ 
  options, 
  value = [], 
  onChange, 
  readOnly = false 
}: CheckboxesResponseInputProps) {
  const currentValue = Array.isArray(value) ? value : [];

  const handleToggleOption = (option: string) => {
    if (readOnly) return;
    
    const newValue = currentValue.includes(option)
      ? currentValue.filter(item => item !== option)
      : [...currentValue, option];
    
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      {options.map((option, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Checkbox
            id={`checkbox-${index}`}
            checked={currentValue.includes(option)}
            onCheckedChange={() => handleToggleOption(option)}
            disabled={readOnly}
          />
          <label 
            htmlFor={`checkbox-${index}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {option}
          </label>
        </div>
      ))}
    </div>
  );
}
