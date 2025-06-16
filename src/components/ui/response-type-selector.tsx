
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StandardResponseType } from "@/types/responseTypes";

interface ResponseTypeSelectorProps {
  value: StandardResponseType;
  onChange: (value: StandardResponseType) => void;
  showDescriptions?: boolean;
  placeholder?: string;
  className?: string;
  size?: "sm" | "default";
}

const RESPONSE_TYPE_OPTIONS = [
  { 
    value: "yes_no" as const, 
    label: "Sim/Não", 
    description: "Resposta binária simples",
    icon: "✓" 
  },
  { 
    value: "text" as const, 
    label: "Texto", 
    description: "Resposta em texto livre",
    icon: "T" 
  },
  { 
    value: "paragraph" as const, 
    label: "Parágrafo", 
    description: "Texto longo com múltiplas linhas",
    icon: "¶" 
  },
  { 
    value: "multiple_choice" as const, 
    label: "Múltipla Escolha", 
    description: "Seleção única entre opções",
    icon: "○" 
  },
  { 
    value: "checkboxes" as const, 
    label: "Caixas de Seleção", 
    description: "Múltiplas seleções",
    icon: "☑" 
  },
  { 
    value: "dropdown" as const, 
    label: "Lista Suspensa", 
    description: "Seleção em dropdown",
    icon: "⌄" 
  },
  { 
    value: "numeric" as const, 
    label: "Numérico", 
    description: "Valores numéricos",
    icon: "#" 
  },
  { 
    value: "date" as const, 
    label: "Data", 
    description: "Seleção de data",
    icon: "📅" 
  },
  { 
    value: "time" as const, 
    label: "Hora", 
    description: "Seleção de horário",
    icon: "🕐" 
  },
  { 
    value: "datetime" as const, 
    label: "Data e Hora", 
    description: "Data e hora combinadas",
    icon: "📅🕐" 
  },
  { 
    value: "photo" as const, 
    label: "Foto", 
    description: "Captura de imagem",
    icon: "📷" 
  },
  { 
    value: "signature" as const, 
    label: "Assinatura", 
    description: "Assinatura digital",
    icon: "✒" 
  }
] as const;

export function ResponseTypeSelector({ 
  value, 
  onChange, 
  showDescriptions = false,
  placeholder = "Selecione o tipo de resposta",
  className = "",
  size = "default"
}: ResponseTypeSelectorProps) {
  const selectedOption = RESPONSE_TYPE_OPTIONS.find(option => option.value === value);
  const triggerHeight = size === "sm" ? "h-9" : "h-10";
  
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`${triggerHeight} ${className}`}>
        <SelectValue placeholder={placeholder}>
          {selectedOption && (
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm opacity-60 flex-shrink-0">
                {selectedOption.icon}
              </span>
              <span className="truncate">
                {selectedOption.label}
              </span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-white z-50">
        {RESPONSE_TYPE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-start gap-3 w-full">
              <span className="text-sm opacity-60 mt-0.5 flex-shrink-0">
                {option.icon}
              </span>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-medium truncate">{option.label}</span>
                {showDescriptions && (
                  <span className="text-xs text-gray-500 truncate">
                    {option.description}
                  </span>
                )}
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
