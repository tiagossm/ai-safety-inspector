
import React from "react";
import { YesNoResponseInput, TextResponseInput } from "./response-types";
import { MediaAnalysisResult } from "@/hooks/useMediaAnalysis";

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
  
  // Handle saving media analysis results
  const handleResponseWithAnalysis = (updatedData: any) => {
    const updatedResponse = {
      ...response,
      ...updatedData
    };
    onResponseChange(updatedResponse);
  };

  // Handle yes/no responses
  if (responseType === 'yes_no') {
    return (
      <YesNoResponseInput
        question={question}
        response={response}
        inspectionId={inspectionId}
        onResponseChange={handleResponseWithAnalysis}
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
      onResponseChange={handleResponseWithAnalysis}
      onMediaChange={handleMediaChange}
      readOnly={readOnly}
    />
  );
};
