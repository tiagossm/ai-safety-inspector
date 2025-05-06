
import React from "react";
import { YesNoResponseInput, TextResponseInput } from "./response-types";

interface ResponseInputRendererProps {
  question: any;
  response: any;
  inspectionId?: string;
  onResponseChange: (value: any) => void;
  onMediaChange?: (mediaUrls: string[]) => void;
  actionPlan?: any;
  onSaveActionPlan?: (data: any) => Promise<void>;
  readOnly?: boolean;
}

export const ResponseInputRenderer: React.FC<ResponseInputRendererProps> = ({
  question,
  response,
  inspectionId,
  onResponseChange,
  onMediaChange,
  actionPlan,
  onSaveActionPlan,
  readOnly = false
}) => {
  // Determine response type
  const responseType = question.responseType || question.tipo_resposta || "text";
  
  const handleMediaChange = (urls: string[]) => {
    if (onMediaChange) {
      onMediaChange(urls);
    }
  };

  // Handle yes/no responses
  if (responseType === 'yes_no') {
    return (
      <YesNoResponseInput
        question={question}
        response={response}
        inspectionId={inspectionId}
        onResponseChange={onResponseChange}
        onMediaChange={handleMediaChange}
        actionPlan={actionPlan}
        onSaveActionPlan={onSaveActionPlan}
        readOnly={readOnly}
      />
    );
  }
  
  // Default to text input for all other types
  return (
    <TextResponseInput
      question={question}
      response={response}
      onResponseChange={onResponseChange}
      onMediaChange={handleMediaChange}
      readOnly={readOnly}
    />
  );
};
