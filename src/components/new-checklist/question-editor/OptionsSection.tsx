
import React, { useState, useEffect } from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { OptionsEditor } from "./OptionsEditor";
import { Button } from "@/components/ui/button";
import { AlertCircle, Info } from "lucide-react";
import { 
  StandardResponseType,
  convertToFrontendType,
  TYPES_REQUIRING_OPTIONS,
  isValidResponseType
} from "@/types/responseTypes";

interface OptionsSectionProps {
  question: ChecklistQuestion;
  onUpdate: (question: ChecklistQuestion) => void;
}

export function OptionsSection({ question, onUpdate }: OptionsSectionProps) {
  const [showOptionsEditor, setShowOptionsEditor] = useState(false);

  const rawFrontendType = question.responseType 
    ? convertToFrontendType(question.responseType) 
    : "yes_no";
  
  const frontendResponseType: StandardResponseType = isValidResponseType(rawFrontendType)
    ? rawFrontendType
    : "text";

  const requiresOptions = TYPES_REQUIRING_OPTIONS.includes(frontendResponseType);
  const hasValidOptions = question.options && Array.isArray(question.options) && question.options.length > 0;

  // Auto-abre editor se necessário
  useEffect(() => {
    if (requiresOptions && !hasValidOptions) {
      setShowOptionsEditor(true);
    }
  }, [requiresOptions, hasValidOptions]);

  if (!requiresOptions) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">
          Opções de resposta
        </label>
        <div className="flex items-center gap-2">
          {!hasValidOptions && (
            <div className="flex items-center gap-1 text-amber-600 text-xs">
              <Info className="h-3 w-3" />
              <span>Obrigatório</span>
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowOptionsEditor(!showOptionsEditor)}
          >
            {showOptionsEditor ? "Ocultar" : "Editar opções"}
          </Button>
        </div>
      </div>

      {requiresOptions && !hasValidOptions && (
        <div className="flex items-center gap-1 text-amber-600 text-xs">
          <AlertCircle className="h-3 w-3" />
          <span>Este tipo requer opções configuradas</span>
        </div>
      )}

      {(showOptionsEditor || !hasValidOptions) && (
        <OptionsEditor 
          question={question} 
          onUpdate={onUpdate} 
        />
      )}
    </div>
  );
}
