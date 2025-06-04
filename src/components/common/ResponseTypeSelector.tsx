
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StandardResponseType } from "@/types/responseTypes";

interface ResponseTypeSelectorProps {
  value: StandardResponseType;
  onChange: (value: StandardResponseType) => void;
  showDescriptions?: boolean;
}

const RESPONSE_TYPE_OPTIONS = [
  { value: "yes_no", label: "Sim/Não", description: "Resposta binária simples" },
  { value: "text", label: "Texto", description: "Resposta em texto livre" },
  { value: "paragraph", label: "Parágrafo", description: "Texto longo com múltiplas linhas" },
  { value: "multiple_choice", label: "Múltipla Escolha", description: "Seleção única entre opções" },
  { value: "checkboxes", label: "Caixas de Seleção", description: "Múltiplas seleções" },
  { value: "dropdown", label: "Lista Suspensa", description: "Seleção em dropdown" },
  { value: "numeric", label: "Numérico", description: "Valores numéricos" },
  { value: "date", label: "Data", description: "Seleção de data" },
  { value: "time", label: "Hora", description: "Seleção de horário" },
  { value: "datetime", label: "Data e Hora", description: "Data e hora combinadas" },
  { value: "photo", label: "Foto", description: "Captura de imagem" },
  { value: "signature", label: "Assinatura", description: "Assinatura digital" }
] as const;

export function ResponseTypeSelector({ value, onChange, showDescriptions = false }: ResponseTypeSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione o tipo de resposta" />
      </SelectTrigger>
      <SelectContent>
        {RESPONSE_TYPE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex flex-col">
              <span>{option.label}</span>
              {showDescriptions && (
                <span className="text-xs text-gray-500">{option.description}</span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
