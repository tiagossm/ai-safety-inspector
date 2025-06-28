
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StandardResponseType } from "@/types/responseTypes";

interface ResponseTypeSelectorProps {
  value: StandardResponseType;
  onChange: (value: StandardResponseType) => void;
  showDescriptions?: boolean;
}

// Array padronizado com values SEMPRE em inglês e labels em português
const RESPONSE_TYPES = [
  { value: "text", label: "Texto", description: "Resposta em texto livre" },
  { value: "paragraph", label: "Parágrafo", description: "Texto longo com múltiplas linhas" },
  { value: "numeric", label: "Numérico", description: "Valores numéricos" },
  { value: "yes_no", label: "Sim/Não", description: "Resposta binária simples" },
  { value: "dropdown", label: "Lista Suspensa", description: "Seleção em dropdown" },
  { value: "multiple_choice", label: "Múltipla Escolha", description: "Seleção única entre opções" },
  { value: "checkboxes", label: "Caixas de Seleção", description: "Múltiplas seleções" },
  { value: "date", label: "Data", description: "Seleção de data" },
  { value: "time", label: "Hora", description: "Seleção de horário" },
  { value: "datetime", label: "Data e Hora", description: "Data e hora combinadas" },
  { value: "photo", label: "Foto", description: "Captura de imagem" },
  { value: "signature", label: "Assinatura", description: "Assinatura digital" }
] as const;

export function ResponseTypeSelector({ value, onChange, showDescriptions = false }: ResponseTypeSelectorProps) {
  const selectedOption = RESPONSE_TYPES.find(option => option.value === value);
  
  const handleValueChange = (newValue: string) => {
    // Garantir que apenas valores válidos sejam aceitos
    const validOption = RESPONSE_TYPES.find(option => option.value === newValue);
    if (validOption) {
      console.log(`ResponseTypeSelector: Alterando de ${value} para ${newValue}`);
      onChange(validOption.value);
    } else {
      console.warn(`ResponseTypeSelector: Valor inválido rejeitado: ${newValue}`);
    }
  };
  
  return (
    <Select value={value} onValueChange={handleValueChange}>
      <SelectTrigger className="h-9">
        <SelectValue placeholder="Selecione o tipo de resposta">
          {selectedOption?.label || "Selecione o tipo de resposta"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-white z-50">
        {RESPONSE_TYPES.map((option) => (
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
