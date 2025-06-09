
import React from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { TYPES_REQUIRING_OPTIONS } from "@/types/responseTypes";
import { UnifiedOptionsEditor } from "./UnifiedOptionsEditor";

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

  if (!requiresOptions) {
    return null;
  }

  return (
    <UnifiedOptionsEditor
      options={options}
      onOptionsChange={onOptionsChange}
      questionId={questionId}
      responseType={responseType}
    />
  );
}
