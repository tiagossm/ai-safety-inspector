
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StandardResponseType } from "@/types/responseTypes";

interface ResponseTypeSelectorProps {
  value: StandardResponseType;
  onChange: (value: StandardResponseType) => void;
}

// Array padronizado com values em inglês e labels em português
const RESPONSE_TYPES = [
  { value: "text", label: "Texto" },
  { value: "paragraph", label: "Parágrafo" },
  { value: "numeric", label: "Numérico" },
  { value: "yes_no", label: "Sim/Não" },
  { value: "dropdown", label: "Lista Suspensa" },
  { value: "multiple_choice", label: "Múltipla Escolha" },
  { value: "checkboxes", label: "Caixas de Seleção" },
  { value: "date", label: "Data" },
  { value: "time", label: "Hora" },
  { value: "datetime", label: "Data e Hora" },
  { value: "photo", label: "Foto" },
  { value: "signature", label: "Assinatura" }
] as const;

export function ResponseTypeSelector({ value, onChange }: ResponseTypeSelectorProps) {
  const selectedOption = RESPONSE_TYPES.find(option => option.value === value);
  
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9">
        <SelectValue>
          {selectedOption?.label || "Selecione"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-white z-50">
        {RESPONSE_TYPES.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
