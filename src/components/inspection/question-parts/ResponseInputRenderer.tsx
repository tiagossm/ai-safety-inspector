
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
  
  // Extract question text to pass to the analysis
  const questionText = question.text || question.pergunta || "";
  
  console.log("ResponseInputRenderer: rendering with responseType:", responseType);
  console.log("ResponseInputRenderer: current response:", response);
  
  const handleMediaChange = (urls: string[]) => {
    console.log("ResponseInputRenderer: Media changed:", urls);
    if (onMediaChange) {
      onMediaChange(urls);
    }
    
    // We also update the response to include the media URLs
    const updatedResponse = {
      ...response,
      mediaUrls: urls
    };
    onResponseChange(updatedResponse);
  };
  
  // Handle saving media analysis results
  const handleResponseWithAnalysis = (updatedData: any) => {
    console.log("ResponseInputRenderer: Handling response with analysis:", updatedData);
    // Certifique-se de que mediaUrls seja preservado na atualização
    const updatedResponse = {
      ...response,
      ...updatedData,
      mediaUrls: updatedData.mediaUrls || response?.mediaUrls || []
    };
    console.log("ResponseInputRenderer: Final updated response:", updatedResponse);
    onResponseChange(updatedResponse);
  };

  // Handle suggested action plan from AI analysis
  const handleActionPlanSuggestion = (suggestion: string) => {
    console.log("ResponseInputRenderer: Action plan suggestion received:", suggestion);
    if (onSaveActionPlan && inspectionId && question.id) {
      // Create action plan data with the AI suggestion
      const actionPlanData = {
        inspectionId,
        questionId: question.id,
        description: suggestion,
        priority: 'medium',
        status: 'pending'
      };
      
      console.log("ResponseInputRenderer: Creating action plan:", actionPlanData);
      onSaveActionPlan(actionPlanData).then(() => {
        console.log("ResponseInputRenderer: Action plan saved successfully");
      }).catch((error) => {
        console.error("ResponseInputRenderer: Error saving action plan:", error);
      });
    }
  };

  // Handle yes/no responses
  if (responseType === 'yes_no') {
    console.log("ResponseInputRenderer: Rendering YesNoResponseInput");
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
  console.log("ResponseInputRenderer: Rendering TextResponseInput");
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
