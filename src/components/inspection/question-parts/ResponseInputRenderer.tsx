
import React from "react";
import { YesNoResponseInput } from "./response-types/YesNoResponseInput";
import { TextResponseInput } from "./response-types/TextResponseInput";
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

  // Handle suggested action plan from AI analysis
  const handleActionPlanSuggestion = (suggestion: string) => {
    if (onSaveActionPlan && inspectionId && question.id) {
      // Create action plan data with the AI suggestion
      const actionPlanData = {
        inspectionId,
        questionId: question.id,
        description: suggestion,
        priority: 'medium',
        status: 'pending'
      };
      
      onSaveActionPlan(actionPlanData);
    }
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
        onApplyAISuggestion={handleActionPlanSuggestion}
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
      onApplyAISuggestion={handleActionPlanSuggestion}
      readOnly={readOnly}
    />
  );
};
