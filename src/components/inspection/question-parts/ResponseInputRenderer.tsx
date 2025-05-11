import React, { useCallback } from "react";
import { YesNoResponseInput } from "./response-types/YesNoResponseInput";
import { TextResponseInput } from "./response-types/TextResponseInput";

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
  
  const handleMediaChange = useCallback((urls: string[]) => {
    console.log("ResponseInputRenderer: Media changed:", urls);
    
    // We update the response to include the media URLs
    const updatedResponse = {
      ...(response || {}),
      mediaUrls: urls
    };
    
    console.log("ResponseInputRenderer: Updating response with new media URLs:", updatedResponse);
    onResponseChange(updatedResponse);
    
    // Also call the onMediaChange callback if provided
    if (onMediaChange) {
      onMediaChange(urls);
    }
  }, [response, onResponseChange, onMediaChange]);
  
  // Handle saving media analysis results
  const handleResponseWithAnalysis = useCallback((updatedData: any) => {
    console.log("ResponseInputRenderer: Handling response with analysis:", updatedData);
    
    // Make sure we preserve all data in the update
    const updatedResponse = {
      ...(response || {}),
      ...updatedData,
      // Explicitly preserve these fields to be sure
      mediaUrls: updatedData.mediaUrls || response?.mediaUrls || [],
      mediaAnalysisResults: updatedData.mediaAnalysisResults || response?.mediaAnalysisResults || {}
    };
    
    console.log("ResponseInputRenderer: Final updated response:", updatedResponse);
    onResponseChange(updatedResponse);
  }, [response, onResponseChange]);

  // Handle suggested action plan from AI analysis
  const handleActionPlanSuggestion = useCallback((suggestion: string) => {
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
  }, [inspectionId, question.id, onSaveActionPlan]);

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
