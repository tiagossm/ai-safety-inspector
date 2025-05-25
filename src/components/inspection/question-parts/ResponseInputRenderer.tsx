
import React, { useCallback } from "react";
import { YesNoResponseInput } from "./response-types/YesNoResponseInput";
import { TextResponseInput } from "./response-types/TextResponseInput";
import { DateResponseInput } from "./response-types/DateResponseInput";
import { TimeResponseInput } from "./response-types/TimeResponseInput";
import { NumberInput } from "@/components/inspection/question-inputs/NumberInput";
import { MultipleChoiceInput } from "@/components/inspection/question-inputs/MultipleChoiceInput";
import { PhotoInput } from "@/components/inspection/question-inputs/PhotoInput";
import { SignatureInput } from "@/components/checklist/SignatureInput";
import { normalizeResponseType } from "@/utils/responseTypeMap";

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
  const rawResponseType = question.responseType || question.tipo_resposta || "texto";
  const responseType = normalizeResponseType(rawResponseType);
  
  console.log("ResponseInputRenderer: raw type:", rawResponseType, "normalized:", responseType);
  console.log("ResponseInputRenderer: current response:", response);

  const safeResponse = response || {};
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

  const handleSimpleValueChange = useCallback((value: any) => {
    console.log("ResponseInputRenderer: Simple value change:", value);
    onResponseChange({
      ...safeResponse,
      value
    });
  }, [safeResponse, onResponseChange]);

  const renderPhotoInput = () => (
    <PhotoInput
      mediaUrls={mediaUrls}
      onMediaChange={handleMediaChange}
      allowsPhoto={question.allowsPhoto}
      allowsVideo={question.allowsVideo}
      allowsAudio={question.allowsAudio}
      allowsFiles={question.allowsFiles}
      inspectionId={inspectionId}
      questionId={question.id}
      disabled={readOnly}
    />
  );

  // Renderizar com base no tipo normalizado
  switch (responseType) {
    case "sim/não":
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

    case "texto":
      return (
        <div className="space-y-2">
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
          {(question.allowsPhoto || question.allowsVideo || question.allowsAudio || question.allowsFiles) && renderPhotoInput()}
        </div>
      );

    case "seleção múltipla":
      return (
        <div className="space-y-2">
          <MultipleChoiceInput 
            options={question.options || []}
            value={
              typeof safeResponse.value === "string"
                ? safeResponse.value
                : safeResponse.value?.value || ""
            }
            onChange={handleSimpleValueChange}
          />
          {(question.allowsPhoto || question.allowsVideo || question.allowsAudio || question.allowsFiles) && renderPhotoInput()}
        </div>
      );

    case "numérico":
      return (
        <div className="space-y-2">
          <NumberInput
            value={
              typeof safeResponse.value === "number"
                ? safeResponse.value
                : typeof safeResponse.value?.value === "number"
                  ? safeResponse.value.value
                  : safeResponse.value?.value !== undefined
                    ? Number(safeResponse.value.value)
                    : undefined
            }
            onChange={handleSimpleValueChange}
          />
          {(question.allowsPhoto || question.allowsVideo || question.allowsAudio || question.allowsFiles) && renderPhotoInput()}
        </div>
      );

    case "foto":
      return renderPhotoInput();

    case "assinatura":
      return (
        <div className="space-y-2">
          <SignatureInput 
            value={
              typeof safeResponse.value === "string"
                ? safeResponse.value
                : safeResponse.value?.value || ""
            }
            onChange={handleSimpleValueChange}
          />
          {(question.allowsPhoto || question.allowsVideo || question.allowsAudio || question.allowsFiles) && renderPhotoInput()}
        </div>
      );

    case "data":
      return (
        <div className="space-y-2">
          <DateResponseInput
            value={
              typeof safeResponse.value === "string"
                ? safeResponse.value
                : safeResponse.value?.value || ""
            }
            onChange={handleSimpleValueChange}
            readOnly={readOnly}
          />
          {(question.allowsPhoto || question.allowsVideo || question.allowsAudio || question.allowsFiles) && renderPhotoInput()}
        </div>
      );

    case "hora":
      return (
        <div className="space-y-2">
          <TimeResponseInput
            value={
              typeof safeResponse.value === "string"
                ? safeResponse.value
                : safeResponse.value?.value || ""
            }
            onChange={handleSimpleValueChange}
            readOnly={readOnly}
          />
          {(question.allowsPhoto || question.allowsVideo || question.allowsAudio || question.allowsFiles) && renderPhotoInput()}
        </div>
      );

    default:
      console.error("ResponseInputRenderer: Unsupported response type:", responseType);
      return (
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <p className="text-red-700">
            Tipo de resposta não suportado: {responseType} (original: {rawResponseType})
          </p>
        </div>
      );
  }
};
