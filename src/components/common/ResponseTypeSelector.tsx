
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StandardResponseType, RESPONSE_TYPE_LABELS, RESPONSE_TYPE_DESCRIPTIONS, isValidResponseType } from "@/types/responseTypes";

interface ResponseTypeSelectorProps {
  value: StandardResponseType;
  onChange: (value: StandardResponseType) => void;
  className?: string;
  showDescriptions?: boolean;
}

export function ResponseTypeSelector({ 
  value, 
  onChange, 
  className,
  showDescriptions = false 
}: ResponseTypeSelectorProps) {
  const handleValueChange = (newValue: string) => {
    // Validar se o valor é um StandardResponseType válido
    if (isValidResponseType(newValue)) {
      onChange(newValue);
    } else {
      console.warn(`Invalid response type: ${newValue}, falling back to 'text'`);
      onChange("text");
    }
  };

  return (
    <Select value={value} onValueChange={handleValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Selecione o tipo" />
      </SelectTrigger>
      <SelectContent className="bg-white z-50 max-h-64 overflow-y-auto">
        {Object.entries(RESPONSE_TYPE_LABELS).map(([key, label]) => (
          <SelectItem key={key} value={key} className="cursor-pointer">
            <div className="flex flex-col">
              <span className="font-medium">{label}</span>
              {showDescriptions && (
                <span className="text-xs text-gray-500">
                  {RESPONSE_TYPE_DESCRIPTIONS[key as StandardResponseType]}
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
