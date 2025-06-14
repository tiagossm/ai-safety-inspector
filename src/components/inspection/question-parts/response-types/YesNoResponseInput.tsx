
import React, { useCallback, useState, useEffect } from "react";
import { ResponseButtonGroup } from "./components/ResponseButtonGroup";
import { StandardActionButtons } from "../StandardActionButtons";
import { MediaUploadInput } from "@/components/inspection/question-inputs/MediaUploadInput";
import { MediaAnalysisDialog } from "@/components/media/MediaAnalysisDialog";
import { MediaAttachments } from "@/components/inspection/question-inputs/MediaAttachments";

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
  response,
  onResponseChange,
  inspectionId,
  onMediaChange,
  actionPlan,
  onSaveActionPlan,
  readOnly = false
}: YesNoResponseInputProps) {
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null);
  const [mediaAnalysisResults, setMediaAnalysisResults] = useState<Record<string, any>>(
    response?.mediaAnalysisResults || {}
  );

  const currentValue = response?.value;
  const mediaUrls = response?.mediaUrls || [];

  // Atualiza resultados locais somente se realmente mudaram
  useEffect(() => {
    if (
      response?.mediaAnalysisResults &&
      JSON.stringify(response.mediaAnalysisResults) !== JSON.stringify(mediaAnalysisResults)
    ) {
      setMediaAnalysisResults(response.mediaAnalysisResults);
    }
  }, [response?.mediaAnalysisResults]);

  const handleResponseChange = useCallback((value: boolean) => {
    const updatedResponse = { ...response, value };
    onResponseChange(updatedResponse);
  }, [response, onResponseChange]);

  const handleMediaChange = useCallback((newMediaUrls: string[]) => {
    if (onMediaChange) {
      onMediaChange(newMediaUrls);
    } else {
      const updatedResponse = { ...response, mediaUrls: newMediaUrls };
      onResponseChange(updatedResponse);
    }
  }, [response, onResponseChange, onMediaChange]);

  // Salva resultado da análise da mídia sem reabrir/reenviar para análise
  const handleAnalysisResults = useCallback((results: any) => {
    const updatedResults = { ...(response?.mediaAnalysisResults || {}), ...results };
    setMediaAnalysisResults(updatedResults);
    const updatedResponse = {
      ...response,
      mediaAnalysisResults: updatedResults
    };
    onResponseChange(updatedResponse);
  }, [response, onResponseChange]);

  // Só abre modal ao clicar no botão, sem trigger por mudanças no estado!
  const handleOpenAnalysis = useCallback(() => {
    if (response?.mediaUrls && response.mediaUrls.length > 0) {
      setSelectedMediaUrl(response.mediaUrls[0]);
    } else {
      setSelectedMediaUrl(null);
    }
    setIsAnalysisOpen(true);
  }, [response?.mediaUrls]);

  const handleDeleteMedia = useCallback((urlToDelete: string) => {
    const updatedMediaUrls = mediaUrls.filter(url => url !== urlToDelete);
    handleMediaChange(updatedMediaUrls);
  }, [mediaUrls, handleMediaChange]);

  return (
    <div className="space-y-4">
      <ResponseButtonGroup
        value={currentValue}
        onChange={handleResponseChange}
        readOnly={readOnly}
      />

      <StandardActionButtons
        question={question}
        inspectionId={inspectionId}
        response={response}
        actionPlan={actionPlan}
        onSaveActionPlan={onSaveActionPlan}
        mediaUrls={mediaUrls}
        readOnly={readOnly}
        mediaAnalysisResults={mediaAnalysisResults}
        onOpenAnalysis={handleOpenAnalysis} // Só usuario manual abre
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
        onSaveAnalysis={(url, result) => {
          setMediaAnalysisResults(prev => ({ ...prev, [url]: result }));
          onResponseChange({
            ...response,
            mediaAnalysisResults: { ...mediaAnalysisResults, [url]: result }
          });
        }}
        analysisResults={mediaAnalysisResults}
      />

      {mediaUrls.length > 0 && (
        <MediaAttachments
          mediaUrls={mediaUrls}
          onDelete={!readOnly ? handleDeleteMedia : undefined}
          onOpenPreview={() => {}}
          onOpenAnalysis={() => {}} // Não dispara nada automático!
          readOnly={readOnly}
          questionText={question.text || question.pergunta || ""}
          analysisResults={mediaAnalysisResults}
          onSaveAnalysis={(url, result) => {
            setMediaAnalysisResults(prev => ({ ...prev, [url]: result }));
            onResponseChange({
              ...response,
              mediaAnalysisResults: { ...mediaAnalysisResults, [url]: result }
            });
          }}
        />
      )}

      <MediaAnalysisDialog
        open={isAnalysisOpen}
        onOpenChange={setIsAnalysisOpen}
        mediaUrl={selectedMediaUrl}
        questionText={question.text || question.pergunta || ""}
        userAnswer={currentValue === true ? "Sim" : currentValue === false ? "Não" : ""}
        onAnalysisComplete={handleAnalysisResults}
        multimodalAnalysis={true}
        additionalMediaUrls={mediaUrls}
      />
    </div>
  );
}
