
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StandardResponseType } from "@/types/responseTypes";

interface ResponseTypeSelectorProps {
  value: StandardResponseType;
  onChange: (value: StandardResponseType) => void;
}

const RESPONSE_TYPE_OPTIONS = [
  { value: 'yes_no' as const, label: 'Sim/Não' },
  { value: 'multiple_choice' as const, label: 'Múltipla escolha' },
  { value: 'dropdown' as const, label: 'Lista suspensa' },
  { value: 'checkboxes' as const, label: 'Caixas de seleção' },
  { value: 'text' as const, label: 'Texto livre' },
  { value: 'numeric' as const, label: 'Numérico' },
  { value: 'photo' as const, label: 'Foto' },
  { value: 'signature' as const, label: 'Assinatura' },
  { value: 'date' as const, label: 'Data' },
  { value: 'time' as const, label: 'Horário' },
  { value: 'datetime' as const, label: 'Data e hora' }
];

export function ResponseTypeSelector({ value, onChange }: ResponseTypeSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {RESPONSE_TYPE_OPTIONS.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
