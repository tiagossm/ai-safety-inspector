import React from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { ResponseTypeSelector } from "@/components/common/ResponseTypeSelector";
import {
  StandardResponseType,
  convertToFrontendType
} from "@/types/responseTypes";

interface ResponseTypeSectionProps {
  question: ChecklistQuestion;
  onUpdate: (question: ChecklistQuestion) => void;
}

export function ResponseTypeSection({
  question,
  onUpdate
}: ResponseTypeSectionProps) {
  /* sempre em StandardResponseType no front-end */
  const frontendResponseType: StandardResponseType = question.responseType
    ? convertToFrontendType(question.responseType)
    : "yes_no";

  const handleResponseTypeChange = (newType: StandardResponseType) => {
    /* mantém o valor padronizado; conversão para DB fica para a camada de API */
    onUpdate({ ...question, responseType: newType });
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Tipo de resposta
      </label>
      <ResponseTypeSelector
        value={frontendResponseType}
        onChange={handleResponseTypeChange}
        showDescriptions
      />
    </div>
  );
}
