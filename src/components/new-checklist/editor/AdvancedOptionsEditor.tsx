
import React from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { TYPES_REQUIRING_OPTIONS } from "@/types/responseTypes";
import { OptionsEditor } from "./OptionsEditor";
import { AlertCircle } from "lucide-react";

interface AdvancedOptionsEditorProps {
  options: string[];
  onOptionsChange: (options: string[]) => void;
  questionId: string;
  responseType: string;
}

export function AdvancedOptionsEditor({
  options,
  onOptionsChange,
  questionId,
  responseType
}: AdvancedOptionsEditorProps) {
  const requiresOptions = TYPES_REQUIRING_OPTIONS.includes(responseType as any);
  const hasValidOptions = options && options.length > 0;

  if (!requiresOptions) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Opções de resposta</label>
        {!hasValidOptions && (
          <div className="flex items-center gap-1 text-amber-600 text-xs">
            <AlertCircle className="h-3 w-3" />
            <span>Obrigatório</span>
          </div>
        )}
      </div>
      
      <OptionsEditor
        options={options}
        onOptionsChange={onOptionsChange}
        questionId={questionId}
        responseType={responseType}
      />
    </div>
  );
}
