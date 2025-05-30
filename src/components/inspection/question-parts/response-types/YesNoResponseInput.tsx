import React, { useCallback, useState, useEffect } from "react";
import { ResponseButtonGroup } from "./components/ResponseButtonGroup";
import { ActionPlanButton } from "./components/ActionPlanButton";
import { MediaAnalysisButton } from "./components/MediaAnalysisButton";
import { MediaUploadInput } from "@/components/inspection/question-inputs/MediaUploadInput";
import { MediaAnalysisDialog } from "@/components/media/MediaAnalysisDialog";
import { MediaAttachments } from "@/components/inspection/question-inputs/MediaAttachments";
// ALTERE aqui conforme o nome do seu novo modal!
import { ActionPlan5W2HDialog } from "@/components/action-plans/ActionPlan5W2HDialog";

interface YesNoResponseInputProps {
  question: any;
  response: any;
  onResponseChange: (data: any) => void;
  inspectionId?: string;
  onMediaChange?: (mediaUrls: string[]) => void;
  actionPlan?: any;
  onSaveActionPlan?: (data: any) => Promise<void>;
  onApplyAISuggestion?: (suggestion: string) => void;
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
  onApplyAISuggestion,
  readOnly = false
}: YesNoResponseInputProps) {
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null);
  const [mediaAnalysisResults, setMediaAnalysisResults] = useState<Record<string, any>>(
    response?.mediaAnalysisResults || {}
  );
  // Novo estado para o modal 5W2H:
  const [isActionPlanDialogOpen, setIsActionPlanDialogOpen] = useState(false);

  const currentValue = response?.value;
  const mediaUrls = response?.mediaUrls || [];

  useEffect(() => {
    if (response?.mediaAnalysisResults) {
      setMediaAnalysisResults(response.mediaAnalysisResults);
    }
  }, [response?.mediaAnalysisResults]);

  const handleResponseChange = useCallback((value: boolean) => {
    const updatedResponse = {
      ...response,
      value
    };
    onResponseChange(updatedResponse);
  }, [response, onResponseChange]);

  const handleMediaChange = useCallback((newMediaUrls: string[]) => {
    if (onMediaChange) {
      onMediaChange(newMediaUrls);
    } else {
      const updatedResponse = {
        ...response,
        mediaUrls: newMediaUrls
      };
      onResponseChange(updatedResponse);
    }
  }, [response, onResponseChange, onMediaChange]);

  const handleAnalysisResults = useCallback((results: any) => {
    const updatedResponse = {
      ...response,
      mediaAnalysisResults: {
        ...(response?.mediaAnalysisResults || {}),
        ...results
      }
    };
    setMediaAnalysisResults(prev => ({
      ...prev,
      ...results
    }));
    onResponseChange(updatedResponse);

    if (results.actionPlanSuggestion && onApplyAISuggestion) {
      onApplyAISuggestion(results.actionPlanSuggestion);
    }
  }, [response, onResponseChange, onApplyAISuggestion]);

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

  const handleOpenPreview = useCallback((url: string) => {}, []);

  const handleOpenMediaAnalysis = useCallback((url: string, questionContext?: string) => {
    setSelectedMediaUrl(url);
    setIsAnalysisOpen(true);
  }, []);

  const handleSaveAnalysis = useCallback((url: string, result: any) => {
    const newResults = {
      ...mediaAnalysisResults,
      [url]: result
    };
    setMediaAnalysisResults(newResults);
    const updatedResponse = {
      ...response,
      mediaAnalysisResults: newResults
    };
    onResponseChange(updatedResponse);
  }, [mediaAnalysisResults, response, onResponseChange]);

  const userAnswer =
    currentValue === true ? "Sim"
    : currentValue === false ? "Não"
    : "";

  return (
    <div className="space-y-4">
      <ResponseButtonGroup 
        value={currentValue} 
        onChange={handleResponseChange} 
        readOnly={readOnly}
      />

      <div className="flex flex-wrap gap-2">
        <ActionPlanButton
          onActionPlanClick={() => setIsActionPlanDialogOpen(true)}
          readOnly={readOnly}
        />
        {(question.allowsPhoto || question.allowsVideo || question.permite_foto || question.permite_video) && (
          <MediaAnalysisButton onOpenAnalysis={handleOpenAnalysis} />
        )}
      </div>

      {/* Botão correto de mídia (ícone de câmera) */}
      <MediaUploadInput
        mediaUrls={mediaUrls}
        onMediaChange={handleMediaChange}
        allowsPhoto={question.allowsPhoto || question.permite_foto || false}
        allowsVideo={question.allowsVideo || question.permite_video || false}
        allowsAudio={question.allowsAudio || question.permite_audio || false}
        allowsFiles={question.allowsFiles || question.permite_files || false}
        readOnly={readOnly}
        questionText={question.text || question.pergunta || ""}
        onSaveAnalysis={handleSaveAnalysis}
        analysisResults={mediaAnalysisResults}
        onApplyAISuggestion={onApplyAISuggestion}
      />

      {mediaUrls.length > 0 && (
        <MediaAttachments
          mediaUrls={mediaUrls}
          onDelete={!readOnly ? handleDeleteMedia : undefined}
          onOpenPreview={handleOpenPreview}
          onOpenAnalysis={handleOpenMediaAnalysis}
          readOnly={readOnly}
          questionText={question.text || question.pergunta || ""}
          analysisResults={mediaAnalysisResults}
          onSaveAnalysis={handleSaveAnalysis}
          onApplyAISuggestion={onApplyAISuggestion}
        />
      )}

      {/* Remova ou comente o bloco abaixo, se existir:
      <MediaUploadInput
        allowsPhoto={question.allowsPhoto || question.permite_foto || false}
        allowsVideo={question.allowsVideo || question.permite_video || false}
        allowsAudio={question.allowsAudio || question.permite_audio || false}
        allowsFiles={question.allowsFiles || question.permite_files || false}
        mediaUrls={mediaUrls}
        onMediaChange={handleMediaChange}
        readOnly={readOnly}
        questionText={question.text || question.pergunta || ""}
        onSaveAnalysis={handleSaveAnalysis}
        analysisResults={mediaAnalysisResults}
        onApplyAISuggestion={onApplyAISuggestion}
      /> */}

      <MediaAnalysisDialog
        open={isAnalysisOpen}
        onOpenChange={setIsAnalysisOpen}
        mediaUrl={selectedMediaUrl}
        questionText={question.text || question.pergunta || ""}
        userAnswer={userAnswer}
        onAnalysisComplete={handleAnalysisResults}
        multimodalAnalysis={true}
        additionalMediaUrls={mediaUrls}
      />

      {/* MODAL 5W2H */}
      <ActionPlan5W2HDialog
        open={isActionPlanDialogOpen}
        onOpenChange={setIsActionPlanDialogOpen}
        questionId={question?.id}
        inspectionId={inspectionId}
        existingPlan={actionPlan}
        onSave={async (data: any) => {
          await onSaveActionPlan?.(data);
          setIsActionPlanDialogOpen(false);
        }}
        iaSuggestions={mediaAnalysisResults}
      />
    </div>
  );
}
