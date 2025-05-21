
import React, { useCallback } from "react";
import { YesNoResponseInput } from "./response-types/YesNoResponseInput";
import { TextResponseInput } from "./response-types/TextResponseInput";
import { DateResponseInput } from "./response-types/DateResponseInput";
import { TimeResponseInput } from "./response-types/TimeResponseInput";
import { NumberInput } from "@/components/inspection/question-inputs/NumberInput";
import { MultipleChoiceInput } from "@/components/inspection/question-inputs/MultipleChoiceInput";
import { PhotoInput } from "@/components/inspection/question-inputs/PhotoInput";
import { SignatureInput } from "@/components/checklist/SignatureInput";

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

  // Função para lidar com mudanças em componentes simples
  const handleSimpleValueChange = useCallback((value: string) => {
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

  if (responseType === "numeric" || responseType === "number") {
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

  if (responseType === "photo") {
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
  }

  if (responseType === "signature") {
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
  }

  if (responseType === "date") {
    return (
      <DateResponseInput
        response={safeResponse}
        value={safeResponse.value}
        onChange={(value) => onResponseChange({ ...safeResponse, value })}
        onMediaChange={handleMediaChange}
        allowsMedia={!!mediaUrls.length || question.permite_foto}
        onMediaUpload={() => console.log("Media upload for date question")}
        readOnly={readOnly}
      />
    );
  }

  if (responseType === "time") {
    return (
      <TimeResponseInput
        response={safeResponse}
        value={safeResponse.value}
        onChange={(value) => onResponseChange({ ...safeResponse, value })}
        onMediaChange={handleMediaChange}
        allowsMedia={!!mediaUrls.length || question.permite_foto}
        onMediaUpload={() => console.log("Media upload for time question")}
        readOnly={readOnly}
      />
    );
  }

  return (
    <div className="p-4 border border-red-300 bg-red-50 rounded-md">
      <p className="text-red-700">
        Tipo de resposta não suportado: {responseType}
      </p>
    </div>
  );
};
