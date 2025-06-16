
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StandardResponseType } from "@/types/responseTypes";

interface ResponseTypeSelectorProps {
  value: StandardResponseType;
  onChange: (value: StandardResponseType) => void;
}

const RESPONSE_TYPE_OPTIONS = [
  { value: "yes_no", label: "Sim/Não" },
  { value: "text", label: "Texto" },
  { value: "paragraph", label: "Parágrafo" },
  { value: "multiple_choice", label: "Múltipla Escolha" },
  { value: "checkboxes", label: "Caixas de Seleção" },
  { value: "dropdown", label: "Lista Suspensa" },
  { value: "numeric", label: "Numérico" },
  { value: "date", label: "Data" },
  { value: "time", label: "Hora" },
  { value: "datetime", label: "Data e Hora" },
  { value: "photo", label: "Foto" },
  { value: "signature", label: "Assinatura" }
] as const;

export function ResponseTypeSelector({ value, onChange }: ResponseTypeSelectorProps) {
  const selectedOption = RESPONSE_TYPE_OPTIONS.find(option => option.value === value);
  
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9">
        <SelectValue>
          {selectedOption?.label || "Selecione"}
        </SelectValue>
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
