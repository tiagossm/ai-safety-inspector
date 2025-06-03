
import React, { useState } from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { OptionsEditor } from "./OptionsEditor";
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
  const rawFrontendType = question.responseType 
    ? convertToFrontendType(question.responseType) 
    : "yes_no";
  
  const frontendResponseType: StandardResponseType = isValidResponseType(rawFrontendType)
    ? rawFrontendType
    : "text";

  const requiresOptions = TYPES_REQUIRING_OPTIONS.includes(frontendResponseType);

  if (!requiresOptions) {
    return null;
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">
        Opções de resposta
      </label>
      <OptionsEditor 
        question={question} 
        onUpdate={onUpdate} 
      />
    </div>
  );
}
