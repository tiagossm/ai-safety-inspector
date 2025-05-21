
import React, { useCallback } from "react";
import { YesNoResponseInput } from "./response-types/YesNoResponseInput";
import { TextResponseInput } from "./response-types/TextResponseInput";
import { DateResponseInput } from "./response-types/DateResponseInput";
import { TimeResponseInput } from "./response-types/TimeResponseInput";

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
  const responseType = question.responseType || question.tipo_resposta || "text";
  const questionText = question.text || question.pergunta || "";

  console.log("ResponseInputRenderer: rendering with responseType:", responseType);
  console.log("ResponseInputRenderer: current response:", response);

  // Ensure response is always an object (even if empty)
  const safeResponse = response || {};
  
  // Make sure mediaUrls is always an array
  const mediaUrls = safeResponse.mediaUrls || [];

  const handleMediaChange = useCallback((urls: string[]) => {
    console.log("ResponseInputRenderer: Media changed:", urls);
    
    const updatedResponse = {
      ...safeResponse,
      mediaUrls: urls
    };
    
    console.log("ResponseInputRenderer: Updating response with media URLs:", updatedResponse);
    onResponseChange(updatedResponse);
    
    if (onMediaChange) {
      onMediaChange(urls);
    }
  }, [safeResponse, onResponseChange, onMediaChange]);

  const handleResponseWithAnalysis = useCallback((updatedData: any) => {
    console.log("ResponseInputRenderer: Handling response with analysis:", updatedData);

    const updatedResponse = {
      ...safeResponse,
      ...updatedData,
    };

    onResponseChange(updatedResponse);
  }, [safeResponse, onResponseChange]);

  const handleSaveActionPlan = useCallback(
    async (actionPlanData: any) => {
      console.log("ResponseInputRenderer: Saving action plan:", actionPlanData);
      if (onSaveActionPlan) {
        await onSaveActionPlan(actionPlanData);
      }
    },
    [onSaveActionPlan]
  );

  if (responseType === "yes_no") {
    return (
      <YesNoResponseInput
        question={question}
        response={safeResponse}
        inspectionId={inspectionId}
        onResponseChange={onResponseChange}
        onMediaChange={handleMediaChange}
        actionPlan={actionPlan}
        onSaveActionPlan={handleSaveActionPlan}
        readOnly={readOnly}
        onApplyAISuggestion={(suggestion: string) =>
          handleResponseWithAnalysis({ aiSuggestion: suggestion })
        }
      />
    );
  }

  if (responseType === "text") {
    return (
      <TextResponseInput
        question={question}
        response={safeResponse}
        onResponseChange={onResponseChange}
        onMediaChange={handleMediaChange}
        onApplyAISuggestion={(suggestion: string) =>
          handleResponseWithAnalysis({ aiSuggestion: suggestion })
        }
        readOnly={readOnly}
      />
    );
  }

  if (responseType === "date") {
    return (
      <DateResponseInput
        question={question}
        response={safeResponse}
        onResponseChange={onResponseChange}
        onMediaChange={handleMediaChange}
        onApplyAISuggestion={(suggestion: string) =>
          handleResponseWithAnalysis({ aiSuggestion: suggestion })
        }
        readOnly={readOnly}
      />
    );
  }

  if (responseType === "time") {
    return (
      <TimeResponseInput
        question={question}
        response={safeResponse}
        onResponseChange={onResponseChange}
        onMediaChange={handleMediaChange}
        onApplyAISuggestion={(suggestion: string) =>
          handleResponseWithAnalysis({ aiSuggestion: suggestion })
        }
        readOnly={readOnly}
      />
    );
  }

  return null;
};
