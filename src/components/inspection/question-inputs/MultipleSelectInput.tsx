import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface MultipleSelectInputProps {
  options: string[];
  value?: string[];
  onChange: (value: string[]) => void;
  readOnly?: boolean;
}

export const MultipleSelectInput: React.FC<MultipleSelectInputProps> = ({
  options = [],
  value = [],
  onChange,
  readOnly = false
}) => {
  const handleChange = (option: string, checked: boolean) => {
    if (checked) {
      onChange([...value, option]);
    } else {
      onChange(value.filter(v => v !== option));
    }
  };

  return (
    <div className="space-y-3">
      {options.map((option, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Checkbox
            id={`option-${index}`}
            checked={value.includes(option)}
            onCheckedChange={(checked) => handleChange(option, !!checked)}
            disabled={readOnly}
          />
          <Label htmlFor={`option-${index}`} className="text-sm font-normal">
            {option}
          </Label>
        </div>
      ))}
    </div>
  );
};