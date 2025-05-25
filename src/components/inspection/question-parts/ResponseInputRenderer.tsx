
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
  // Normalizar o tipo de resposta para garantir consistência
  const rawResponseType = question.responseType || question.tipo_resposta || "texto";
  const responseType = normalizeResponseType(rawResponseType);
  
  console.log("ResponseInputRenderer: raw type:", rawResponseType, "normalized:", responseType);
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

  // Função para lidar com mudanças em componentes simples
  const handleSimpleValueChange = useCallback((value: any) => {
    console.log("ResponseInputRenderer: Simple value change:", value);
    onResponseChange({
      ...safeResponse,
      value
    });
  }, [safeResponse, onResponseChange]);

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
          {(question.allowsPhoto || question.allowsVideo || question.allowsAudio || question.allowsFiles) && (
            <PhotoInput
              mediaUrls={mediaUrls}
              onAddMedia={() => console.log("Adicionar mídia para questão seleção múltipla")}
              onDeleteMedia={(url) => {
                const updatedUrls = mediaUrls.filter((mediaUrl) => mediaUrl !== url);
                handleMediaChange(updatedUrls);
              }}
              allowsPhoto={question.allowsPhoto}
              allowsVideo={question.allowsVideo}
              allowsAudio={question.allowsAudio}
              allowsFiles={question.allowsFiles}
            />
          )}
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
          {(question.allowsPhoto || question.allowsVideo || question.allowsAudio || question.allowsFiles) && (
            <PhotoInput
              mediaUrls={mediaUrls}
              onAddMedia={() => console.log("Adicionar mídia para questão numérico")}
              onDeleteMedia={(url) => {
                const updatedUrls = mediaUrls.filter((mediaUrl) => mediaUrl !== url);
                handleMediaChange(updatedUrls);
              }}
              allowsPhoto={question.allowsPhoto}
              allowsVideo={question.allowsVideo}
              allowsAudio={question.allowsAudio}
              allowsFiles={question.allowsFiles}
            />
          )}
        </div>
      );

    case "foto":
      return (
        <PhotoInput
          mediaUrls={mediaUrls}
          onAddMedia={() => console.log("Adicionar mídia para questão foto")}
          onDeleteMedia={(url) => {
            const updatedUrls = mediaUrls.filter((mediaUrl) => mediaUrl !== url);
            handleMediaChange(updatedUrls);
          }}
          allowsPhoto={true}
          allowsVideo={question.allowsVideo}
          allowsAudio={question.allowsAudio}
          allowsFiles={question.allowsFiles}
        />
      );

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
          {(question.allowsPhoto || question.allowsVideo || question.allowsAudio || question.allowsFiles) && (
            <PhotoInput
              mediaUrls={mediaUrls}
              onAddMedia={() => console.log("Adicionar mídia para questão assinatura")}
              onDeleteMedia={(url) => {
                const updatedUrls = mediaUrls.filter((mediaUrl) => mediaUrl !== url);
                handleMediaChange(updatedUrls);
              }}
              allowsPhoto={question.allowsPhoto}
              allowsVideo={question.allowsVideo}
              allowsAudio={question.allowsAudio}
              allowsFiles={question.allowsFiles}
            />
          )}
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
          {(question.allowsPhoto || question.allowsVideo || question.allowsAudio || question.allowsFiles) && (
            <PhotoInput
              mediaUrls={mediaUrls}
              onAddMedia={() => console.log("Adicionar mídia para questão data")}
              onDeleteMedia={(url) => {
                const updatedUrls = mediaUrls.filter((mediaUrl) => mediaUrl !== url);
                handleMediaChange(updatedUrls);
              }}
              allowsPhoto={question.allowsPhoto}
              allowsVideo={question.allowsVideo}
              allowsAudio={question.allowsAudio}
              allowsFiles={question.allowsFiles}
            />
          )}
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
          {(question.allowsPhoto || question.allowsVideo || question.allowsAudio || question.allowsFiles) && (
            <PhotoInput
              mediaUrls={mediaUrls}
              onAddMedia={() => console.log("Adicionar mídia para questão hora")}
              onDeleteMedia={(url) => {
                const updatedUrls = mediaUrls.filter((mediaUrl) => mediaUrl !== url);
                handleMediaChange(updatedUrls);
              }}
              allowsPhoto={question.allowsPhoto}
              allowsVideo={question.allowsVideo}
              allowsAudio={question.allowsAudio}
              allowsFiles={question.allowsFiles}
            />
          )}
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
