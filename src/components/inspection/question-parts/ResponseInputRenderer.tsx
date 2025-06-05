
import React, { useCallback } from "react";
import { YesNoResponseInput } from "./response-types/YesNoResponseInput";
import { TextResponseInput } from "./response-types/TextResponseInput";
import { ParagraphResponseInput } from "./response-types/ParagraphResponseInput";
import { CheckboxesResponseInput } from "./response-types/CheckboxesResponseInput";
import { DropdownResponseInput } from "./response-types/DropdownResponseInput";
import { DateTimeResponseInput } from "./response-types/DateTimeResponseInput";
import { DateInput } from "@/components/inspection/question-inputs/DateInput";
import { TimeInput } from "@/components/inspection/question-inputs/TimeInput";
import { NumberInput } from "@/components/inspection/question-inputs/NumberInput";
import { PhotoInput } from "@/components/inspection/question-inputs/PhotoInput";
import { SignatureInput } from "@/components/checklist/SignatureInput";
import { EnhancedMultipleChoiceInput } from "./response-types/EnhancedMultipleChoiceInput";
import { convertToFrontendType, validateResponseValue, TYPES_REQUIRING_OPTIONS } from "@/types/responseTypes";

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
  // Normalizar tipo de resposta para formato padrão
  const rawResponseType = question.responseType || question.tipo_resposta || "text";
  const responseType = convertToFrontendType(rawResponseType);

  console.log("ResponseInputRenderer: rendering with responseType:", responseType);
  console.log("ResponseInputRenderer: current response:", response);

  // Ensure response is always an object (even if empty)
  const safeResponse = response || {};
  
  // Make sure mediaUrls is always an array
  const mediaUrls = safeResponse.mediaUrls || [];

  // Validar se o tipo requer opções
  const requiresOptions = TYPES_REQUIRING_OPTIONS.includes(responseType);
  const hasValidOptions = question.options && Array.isArray(question.options) && question.options.length > 0;

  if (requiresOptions && !hasValidOptions) {
    return (
      <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-md">
        <p className="text-yellow-700">
          Este tipo de pergunta ({responseType}) requer opções configuradas.
        </p>
      </div>
    );
  }

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
    // Validar valor antes de salvar
    if (!validateResponseValue(responseType, value)) {
      console.warn(`Invalid value for type ${responseType}:`, value);
    }

    onResponseChange({
      ...safeResponse,
      value
    });
  }, [safeResponse, onResponseChange, responseType]);

  // Renderização baseada no tipo de resposta
  switch (responseType) {
    case "yes_no":
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

    case "text":
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

    case "paragraph":
      return (
        <div className="space-y-2">
          <ParagraphResponseInput
            value={safeResponse.value}
            onChange={handleSimpleValueChange}
            readOnly={readOnly}
          />
          {(question.allowsPhoto || question.allowsVideo || question.allowsAudio || question.allowsFiles) && (
            <PhotoInput
              mediaUrls={mediaUrls}
              onAddMedia={() => console.log("Adicionar mídia para questão parágrafo")}
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

    case "multiple_choice":
    case "checkboxes":
    case "dropdown":
      return (
        <div className="space-y-2">
          <EnhancedMultipleChoiceInput
            question={question}
            value={safeResponse}
            onChange={onResponseChange}
            readOnly={readOnly}
          />
          {(question.allowsPhoto || question.allowsVideo || question.allowsAudio || question.allowsFiles) && (
            <PhotoInput
              mediaUrls={mediaUrls}
              onAddMedia={() => console.log("Adicionar mídia para questão múltipla escolha")}
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

    case "numeric":
      return (
        <div className="space-y-2">
          <NumberInput
            value={safeResponse.value}
            onChange={handleSimpleValueChange}
          />
          {(question.allowsPhoto || question.allowsVideo || question.allowsAudio || question.allowsFiles) && (
            <PhotoInput
              mediaUrls={mediaUrls}
              onAddMedia={() => console.log("Adicionar mídia para questão numeric")}
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

    case "photo":
      return (
        <PhotoInput
          mediaUrls={mediaUrls}
          onAddMedia={() => console.log("Adicionar mídia para questão photo")}
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

    case "signature":
      return (
        <div className="space-y-2">
          <SignatureInput 
            value={safeResponse.value || ""}
            onChange={handleSimpleValueChange}
          />
          {(question.allowsPhoto || question.allowsVideo || question.allowsAudio || question.allowsFiles) && (
            <PhotoInput
              mediaUrls={mediaUrls}
              onAddMedia={() => console.log("Adicionar mídia para questão signature")}
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

    case "date":
      return (
        <DateInput
          value={safeResponse.value}
          onChange={handleSimpleValueChange}
          readOnly={readOnly}
        />
      );

    case "time":
      return (
        <TimeInput
          value={safeResponse.value}
          onChange={handleSimpleValueChange}
          readOnly={readOnly}
        />
      );

    case "datetime":
      return (
        <DateTimeResponseInput
          value={safeResponse.value}
          onChange={handleSimpleValueChange}
          readOnly={readOnly}
        />
      );

    default:
      return (
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <p className="text-red-700">
            Tipo de resposta não suportado: {responseType}
          </p>
        </div>
      );
  }
};
