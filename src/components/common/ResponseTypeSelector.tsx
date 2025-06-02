
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StandardResponseType, RESPONSE_TYPE_LABELS } from "@/types/responseTypes";

interface ResponseTypeSelectorProps {
  value: StandardResponseType;
  onChange: (value: StandardResponseType) => void;
  className?: string;
}

export function ResponseTypeSelector({ value, onChange, className }: ResponseTypeSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Selecione o tipo" />
      </SelectTrigger>
      <SelectContent className="bg-white z-50">
        {Object.entries(RESPONSE_TYPE_LABELS).map(([key, label]) => (
          <SelectItem key={key} value={key}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
