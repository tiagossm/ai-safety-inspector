
import React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface DropdownInputProps {
  options: string[];
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export function DropdownInput({ 
  options, 
  value, 
  onChange, 
  placeholder = "Selecione uma opção...",
  readOnly = false 
}: DropdownInputProps) {
  if (!options || options.length === 0) {
    return (
      <div className="text-sm text-gray-500 p-2 border border-yellow-200 bg-yellow-50 rounded">
        Nenhuma opção configurada para esta pergunta
      </div>
    );
  }

  return (
    <div className="mt-2">
      <Select 
        value={value || ""} 
        onValueChange={onChange}
        disabled={readOnly}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-white z-50">
          {options.map((option, index) => (
            <SelectItem key={index} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
