
import React from "react";
import { AlertCircle } from "lucide-react";

interface ValidationResult {
  isValid: boolean;
  hasText: boolean;
  hasValidOptions: boolean;
  hasValidWeight: boolean;
  requiresOptions: boolean;
}

interface QuestionValidationAlertProps {
  validation: ValidationResult;
}

export function QuestionValidationAlert({ validation }: QuestionValidationAlertProps) {
  if (validation.isValid) {
    return null;
  }

  return (
    <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
      <div className="flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
        <div className="text-sm text-amber-800">
          <div className="font-medium mb-1">Esta pergunta precisa de atenção:</div>
          <ul className="text-xs space-y-0.5">
            {!validation.hasText && <li>• Adicione o texto da pergunta</li>}
            {validation.requiresOptions && !validation.hasValidOptions && <li>• Adicione opções de resposta</li>}
            {!validation.hasValidWeight && <li>• Defina um peso válido (maior que 0)</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
