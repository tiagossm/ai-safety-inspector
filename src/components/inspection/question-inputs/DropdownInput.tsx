import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DropdownInputProps {
  options: string[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export const DropdownInput: React.FC<DropdownInputProps> = ({
  options = [],
  value = "",
  onChange,
  placeholder = "Selecione uma opção",
  readOnly = false
}) => {
  return (
    <Select value={value} onValueChange={onChange} disabled={readOnly}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option, index) => (
          <SelectItem key={index} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};