import React from "react";
import { ResponseButtonGroup } from "./components/ResponseButtonGroup";
import { BaseResponseInput } from "./base/BaseResponseInput";
import { standardizeResponse, standardizeQuestion } from "@/utils/responseTypeStandardization";

interface YesNoResponseInputProps {
  question: any;
  response: any;
  onResponseChange: (data: any) => void;
  inspectionId?: string;
  onMediaChange?: (mediaUrls: string[]) => void;
  actionPlan?: any;
  onSaveActionPlan?: (data: any) => Promise<void>;
  onApplyAISuggestion?: (suggestion: string) => void;
  readOnly?: boolean;
}

export function YesNoResponseInput({
  question,
  response,
  onResponseChange,
  inspectionId,
  onMediaChange,
  actionPlan,
  onSaveActionPlan,
  onApplyAISuggestion,
  readOnly = false
}: YesNoResponseInputProps) {
  const standardQuestion = standardizeQuestion(question);
  const standardResponse = standardizeResponse(response);
  const currentValue = standardResponse?.value;

  const handleResponseChange = (value: boolean) => {
    const updatedResponse = {
      ...standardResponse,
      value
    };
    onResponseChange(updatedResponse);
  };

  return (
    <BaseResponseInput
      question={question}
      response={response}
      onResponseChange={onResponseChange}
      inspectionId={inspectionId}
      actionPlan={actionPlan}
      onSaveActionPlan={onSaveActionPlan}
      onMediaChange={onMediaChange}
      onApplyAISuggestion={onApplyAISuggestion}
      readOnly={readOnly}
    >
      <ResponseButtonGroup 
        value={currentValue} 
        onChange={handleResponseChange} 
        readOnly={readOnly}
      />
    </BaseResponseInput>
  );
}
