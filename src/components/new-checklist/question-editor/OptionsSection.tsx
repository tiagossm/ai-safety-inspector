
import React, { useState, useEffect } from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { OptionsEditor } from "./OptionsEditor";
import { Button } from "@/components/ui/button";
import { AlertCircle, Settings } from "lucide-react";
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

  // Sempre mostrar editor de opções se necessário
  useEffect(() => {
    if (requiresOptions) {
      setShowOptionsEditor(true);
      
      // Auto-criar opções padrão se não existirem
      if (!hasValidOptions) {
        const updatedQuestion = {
          ...question,
          options: ["Opção 1", "Opção 2"]
        };
        onUpdate(updatedQuestion);
      }
    } else {
      setShowOptionsEditor(false);
    }
  }, [requiresOptions, hasValidOptions, question, onUpdate]);

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
              <AlertCircle className="h-3 w-3" />
              <span>Configuração necessária</span>
            </div>
          )}
          {hasValidOptions && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowOptionsEditor(!showOptionsEditor)}
              className="flex items-center gap-1"
            >
              <Settings className="h-3 w-3" />
              {showOptionsEditor ? "Ocultar" : "Configurar"}
            </Button>
          )}
        </div>
      </div>

      {/* Sempre mostrar para tipos que requerem opções */}
      {requiresOptions && (
        <OptionsEditor 
          question={question} 
          onUpdate={onUpdate} 
        />
      )}

      {hasValidOptions && (
        <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
          ✓ {question.options?.length} opções configuradas
        </div>
      )}
    </div>
  );
}
