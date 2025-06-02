
import React from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { validateResponseValue, StandardResponseType } from "@/types/responseTypes";

interface ResponseValidatorProps {
  responseType: StandardResponseType;
  value: any;
  isRequired?: boolean;
  showValidIcon?: boolean;
}

export function ResponseValidator({ 
  responseType, 
  value, 
  isRequired = false,
  showValidIcon = true 
}: ResponseValidatorProps) {
  const isEmpty = value === null || value === undefined || value === "" || 
                  (Array.isArray(value) && value.length === 0);
  
  const isValid = validateResponseValue(responseType, value);
  
  // Se não é obrigatório e está vazio, não mostra validação
  if (!isRequired && isEmpty) {
    return null;
  }
  
  // Se é obrigatório e está vazio
  if (isRequired && isEmpty) {
    return (
      <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
        <AlertCircle className="h-4 w-4" />
        <span>Esta pergunta é obrigatória</span>
      </div>
    );
  }
  
  // Se tem valor mas é inválido
  if (!isEmpty && !isValid) {
    return (
      <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
        <AlertCircle className="h-4 w-4" />
        <span>Valor inválido para este tipo de pergunta</span>
      </div>
    );
  }
  
  // Se tem valor válido e deve mostrar ícone de válido
  if (!isEmpty && isValid && showValidIcon) {
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm mt-1">
        <CheckCircle className="h-4 w-4" />
        <span>Resposta válida</span>
      </div>
    );
  }
  
  return null;
}
