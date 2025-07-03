
import React, { useCallback } from "react";
import { YesNoResponseInput } from "./response-types/YesNoResponseInput";
import { TextResponseInput } from "./response-types/TextResponseInput";
import { DateResponseInput } from "./response-types/DateResponseInput";
import { TimeResponseInput } from "./response-types/TimeResponseInput";
import { NumberInput } from "@/components/inspection/question-inputs/NumberInput";
import { MultipleChoiceInput } from "@/components/inspection/question-inputs/MultipleChoiceInput";
import { ParagraphInput } from "@/components/inspection/question-inputs/ParagraphInput";
import { DropdownInput } from "@/components/inspection/question-inputs/DropdownInput";
import { MultipleSelectInput } from "@/components/inspection/question-inputs/MultipleSelectInput";
import { DateTimeInput } from "@/components/inspection/question-inputs/DateTimeInput";
import { PhotoInput } from "@/components/inspection/question-inputs/PhotoInput";
import { SignatureInput } from "@/components/checklist/SignatureInput";
import { databaseToFrontendResponseType } from "@/utils/responseTypeMap";

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
  // Normalizar o tipo de resposta
  const dbResponseType = question.responseType || question.tipo_resposta || "sim/não";
  const responseType = databaseToFrontendResponseType(dbResponseType);
  
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

  // Função para lidar com mudanças em componentes simples
  const handleSimpleValueChange = useCallback((value: any) => {
    onResponseChange({
      ...safeResponse,
      value
    });
  }, [safeResponse, onResponseChange]);

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

  if (responseType === "paragraph") {
    return (
      <div className="space-y-2">
        <ParagraphInput
          value={safeResponse.value}
          onChange={handleSimpleValueChange}
          readOnly={readOnly}
        />
        {(question.allowsPhoto || question.allowsVideo || question.allowsAudio || question.allowsFiles) && (
          <PhotoInput
            mediaUrls={mediaUrls}
            onAddMedia={() => console.log("Adicionar mídia para questão paragraph")}
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
  }

  if (responseType === "dropdown") {
    return (
      <div className="space-y-2">
        <DropdownInput 
          options={question.options || []}
          value={safeResponse.value}
          onChange={handleSimpleValueChange}
          readOnly={readOnly}
        />
        {(question.allowsPhoto || question.allowsVideo || question.allowsAudio || question.allowsFiles) && (
          <PhotoInput
            mediaUrls={mediaUrls}
            onAddMedia={() => console.log("Adicionar mídia para questão dropdown")}
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
  }

  if (responseType === "multiple_select") {
    return (
      <div className="space-y-2">
        <MultipleSelectInput 
          options={question.options || []}
          value={Array.isArray(safeResponse.value) ? safeResponse.value : []}
          onChange={(value) => handleSimpleValueChange(value)}
          readOnly={readOnly}
        />
        {(question.allowsPhoto || question.allowsVideo || question.allowsAudio || question.allowsFiles) && (
          <PhotoInput
            mediaUrls={mediaUrls}
            onAddMedia={() => console.log("Adicionar mídia para questão multiple_select")}
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
  }

  if (responseType === "datetime") {
    return (
      <DateTimeInput
        value={safeResponse.value}
        onChange={(value) => handleSimpleValueChange(value)}
        readOnly={readOnly}
      />
    );
  }

  if (responseType === "multiple_choice") {
    return (
      <div className="space-y-2">
        <MultipleChoiceInput 
          options={question.options || []}
          value={safeResponse.value}
          onChange={handleSimpleValueChange}
        />
        {(question.allowsPhoto || question.allowsVideo || question.allowsAudio || question.allowsFiles) && (
          <PhotoInput
            mediaUrls={mediaUrls}
            onAddMedia={() => console.log("Adicionar mídia para questão multiple_choice")}
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
  }

  if (responseType === "numeric") {
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
  }

  if (responseType === "date") {
    return (
      <DateResponseInput
        value={safeResponse.value}
        onChange={(value) => handleSimpleValueChange(value)}
        readOnly={readOnly}
      />
    );
  }

  if (responseType === "time") {
    return (
      <TimeResponseInput
        value={safeResponse.value}
        onChange={(value) => handleSimpleValueChange(value)}
        readOnly={readOnly}
      />
    );
  }

  return (
    <div className="p-4 border border-red-300 bg-red-50 rounded-md">
      <p className="text-red-700">
        Tipo de resposta não suportado: {responseType} (original: {dbResponseType})
      </p>
    </div>
  );
};
