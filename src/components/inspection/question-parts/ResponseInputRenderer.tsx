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
  const responseType = question.responseType || question.tipo_resposta || "text";
  const questionText = question.text || question.pergunta || "";

  console.log("ResponseInputRenderer: rendering with responseType:", responseType);
  console.log("ResponseInputRenderer: current response:", response);

  const handleMediaChange = useCallback((urls: string[]) => {
    console.log("ResponseInputRenderer: Media changed:", urls);

    const existingMedia = response?.mediaUrls ?? [];
    const combinedUrls = [...existingMedia, ...urls];

    const updatedResponse = {
      ...(response || {}),
      mediaUrls: combinedUrls
    };

    console.log("ResponseInputRenderer: Updating response with combined media URLs:", updatedResponse);
    onResponseChange(updatedResponse);

    if (onMediaChange) {
      onMediaChange(combinedUrls);
    }
  }, [response, onResponseChange, onMediaChange]);

  const handleResponseWithAnalysis = useCallback((updatedData: any) => {
    console.log("ResponseInputRenderer: Handling response with analysis:", updatedData);

    const updatedResponse = {
      ...(response || {}),
      ...updatedData,
    };

    onResponseChange(updatedResponse);
  }, [response, onResponseChange]);

  if (responseType === "yes_no") {
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
        response={response}
        onResponseChange={onResponseChange}
        readOnly={readOnly}
      />
    );
  }

  return null;
};
