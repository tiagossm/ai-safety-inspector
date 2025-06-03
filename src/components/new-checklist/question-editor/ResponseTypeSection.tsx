
import React from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { ResponseTypeSelector } from "@/components/common/ResponseTypeSelector";
import { 
  StandardResponseType,
  convertToFrontendType,
  convertToDatabaseType,
  isValidResponseType
} from "@/types/responseTypes";

interface ResponseTypeSectionProps {
  question: ChecklistQuestion;
  onUpdate: (question: ChecklistQuestion) => void;
}

export function ResponseTypeSection({ question, onUpdate }: ResponseTypeSectionProps) {
  const rawFrontendType = question.responseType 
    ? convertToFrontendType(question.responseType) 
    : "yes_no";
  
  const frontendResponseType: StandardResponseType = isValidResponseType(rawFrontendType)
    ? rawFrontendType
    : "text";

  const handleResponseTypeChange = (newResponseType: StandardResponseType) => {
    if (isValidResponseType(newResponseType)) {
      const dbType = convertToDatabaseType(newResponseType);
      onUpdate({ ...question, responseType: dbType });
    } else {
      console.warn(`Invalid response type received: ${newResponseType}, falling back to 'text'`);
      onUpdate({ ...question, responseType: convertToDatabaseType("text") });
    }
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
