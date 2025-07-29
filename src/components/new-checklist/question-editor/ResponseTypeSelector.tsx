import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STANDARD_RESPONSE_TYPES } from "@/utils/responseTypeMap";

interface ResponseTypeSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ResponseTypeSelector({ value, onChange, disabled = false }: ResponseTypeSelectorProps) {
  return (
    <Select value={value || ""} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Selecione o tipo de resposta" />
      </SelectTrigger>
      <SelectContent className="bg-background border border-border shadow-lg z-50">
        {STANDARD_RESPONSE_TYPES.map((type) => (
          <SelectItem 
            key={type.value} 
            value={type.value}
            className="cursor-pointer hover:bg-accent"
          >
            {type.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}