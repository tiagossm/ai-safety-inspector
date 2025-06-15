
import React, { useCallback, useState } from "react";
import { ResponseButtonGroup } from "./components/ResponseButtonGroup";
import { StandardActionButtons } from "../StandardActionButtons";
import { MediaUploadInput } from "@/components/inspection/question-inputs/MediaUploadInput";
import { MediaAttachments } from "@/components/inspection/question-inputs/MediaAttachments";
import { MediaAnalysisResult } from "@/hooks/useMediaAnalysis";

interface YesNoResponseInputProps {
  question: any;
  response: any;
  onResponseChange: (data: any) => void;
  inspectionId?: string;
  onMediaChange?: (mediaUrls: string[]) => void;
  actionPlan?: any;
  onSaveActionPlan?: (data: any) => Promise<void>;
  readOnly?: boolean;
}

export function YesNoResponseInput({
  question,
  response = {},
  onResponseChange,
  inspectionId,
  onMediaChange,
  actionPlan,
  onSaveActionPlan,
  readOnly = false
}: YesNoResponseInputProps) {
  // Garantir estrutura consistente do response
  const safeResponse = {
    value: response?.value,
    mediaUrls: Array.isArray(response?.mediaUrls) ? response.mediaUrls : [],
    mediaAnalysisResults: response?.mediaAnalysisResults || {},
    ...response
  };

  const currentValue = safeResponse.value;
  const mediaUrls = safeResponse.mediaUrls;

  // Handler para mudança no valor da resposta
  const handleResponseChange = useCallback(
    (value: boolean) => {
      onResponseChange({ ...safeResponse, value });
    },
    [safeResponse, onResponseChange]
  );

  // Handler para mudança nas URLs de mídia
  const handleMediaChange = useCallback(
    (newMediaUrls: string[]) => {
      const updatedResponse = { ...safeResponse, mediaUrls: newMediaUrls };
      onResponseChange(updatedResponse);
      
      if (onMediaChange) {
        onMediaChange(newMediaUrls);
      }
    },
    [safeResponse, onResponseChange, onMediaChange]
  );

  // Handler para resultados da análise de IA
  const handleAnalysisResults = useCallback(
    (mediaUrl: string, result: MediaAnalysisResult) => {
      const updatedResults = { 
        ...safeResponse.mediaAnalysisResults, 
        [mediaUrl]: result 
      };
      
      onResponseChange({
        ...safeResponse,
        mediaAnalysisResults: updatedResults,
      });
    },
    [safeResponse, onResponseChange]
  );

  // Handler para deletar mídia
  const handleDeleteMedia = useCallback(
    (urlToDelete: string) => {
      const updatedMediaUrls = mediaUrls.filter((url) => url !== urlToDelete);
      const updatedResults = { ...safeResponse.mediaAnalysisResults };
      delete updatedResults[urlToDelete];

      onResponseChange({
        ...safeResponse,
        mediaUrls: updatedMediaUrls,
        mediaAnalysisResults: updatedResults,
      });
    },
    [mediaUrls, safeResponse, onResponseChange]
  );

  // Handler para abrir análise de IA
  const handleOpenAnalysis = useCallback(
    (url: string, questionContext?: string) => {
      console.log("Abrindo análise para URL:", url, "com contexto:", questionContext);
      // Este handler será usado pelo MediaAttachments para abrir a análise de IA
      // A lógica específica de abertura do modal será implementada internamente pelo MediaAttachments
    },
    []
  );

  return (
    <div className="space-y-4">
      <ResponseButtonGroup
        value={currentValue}
        onChange={handleResponseChange}
        readOnly={readOnly}
      />

      <StandardActionButtons
        question={question}
        readOnly={readOnly}
        mediaUrls={mediaUrls}
        inspectionId={inspectionId}
        response={safeResponse}
        actionPlan={actionPlan}
        onSaveActionPlan={onSaveActionPlan}
        mediaAnalysisResults={safeResponse.mediaAnalysisResults}
        dummyProp="UniqueKeyForProps20250615"
      />

      <MediaUploadInput
        mediaUrls={mediaUrls}
        onMediaChange={handleMediaChange}
        allowsPhoto={question.allowsPhoto || question.permite_foto || false}
        allowsVideo={question.allowsVideo || question.permite_video || false}
        allowsAudio={question.allowsAudio || question.permite_audio || false}
        allowsFiles={question.allowsFiles || question.permite_files || false}
        readOnly={readOnly}
        questionText={question.text || question.pergunta || ""}
        onSaveAnalysis={handleAnalysisResults}
        analysisResults={safeResponse.mediaAnalysisResults}
      />

      {mediaUrls.length > 0 && (
        <MediaAttachments
          mediaUrls={mediaUrls}
          onDelete={!readOnly ? handleDeleteMedia : undefined}
          onOpenPreview={() => {}}
          onOpenAnalysis={handleOpenAnalysis}
          readOnly={readOnly}
          questionText={question.text || question.pergunta || ""}
          analysisResults={safeResponse.mediaAnalysisResults}
          onSaveAnalysis={handleAnalysisResults}
        />
      )}
    </div>
  );
}
