
import React from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { ResponseTypeSelector } from "@/components/common/ResponseTypeSelector";
import { 
  StandardResponseType,
  convertToFrontendType,
  convertToDatabaseType
} from "@/types/responseTypes";

interface ResponseTypeSectionProps {
  question: ChecklistQuestion;
  onUpdate: (question: ChecklistQuestion) => void;
}

export function ResponseTypeSection({ question, onUpdate }: ResponseTypeSectionProps) {
  // Convert database response type to frontend type - now guaranteed to return StandardResponseType
  const frontendResponseType: StandardResponseType = question.responseType 
    ? convertToFrontendType(question.responseType) 
    : "yes_no";

  const handleResponseTypeChange = (newResponseType: StandardResponseType) => {
    // A função já recebe um StandardResponseType válido do ResponseTypeSelector
    const dbType = convertToDatabaseType(newResponseType);
    onUpdate({ ...question, responseType: dbType });
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Tipo de resposta
      </label>
      <ResponseTypeSelector
        value={frontendResponseType}
        onChange={handleResponseTypeChange}
        showDescriptions={true}
      />
    </div>
  );
}
