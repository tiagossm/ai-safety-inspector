import React, { useCallback, useState, useEffect } from "react";
import { ResponseButtonGroup } from "./components/ResponseButtonGroup";
import { ActionPlanButton } from "./components/ActionPlanButton";
import { MediaUploadInput } from "@/components/inspection/question-inputs/MediaUploadInput";
import { MediaAnalysisButton } from "./components/MediaAnalysisButton";
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

  // LOG para depuração avançada:
  console.log("[YesNoResponseInput] Chegou no render. currentValue:", currentValue);
  console.log("[YesNoResponseInput] Antes de renderizar ActionPlanButton");
  console.log(
    "[YesNoResponseInput] Renderizando ActionPlanButton. onSaveActionPlan:",
    typeof onSaveActionPlan,
    "readOnly:", readOnly
  );

  return (
    <div className="space-y-4">
      <ResponseButtonGroup 
        value={currentValue} 
        onChange={handleResponseChange} 
        readOnly={readOnly}
      />

      <div className="flex flex-wrap gap-2">
        <ActionPlanButton
          onActionPlanClick={
            onSaveActionPlan
              ? () => onSaveActionPlan({
                  resposta: currentValue,
                  questionId: question?.id,
                  // acrescente outros campos relevantes para seu contexto
                })
              : undefined
          }
          readOnly={readOnly}
        />
        {(question.allowsPhoto || question.allowsVideo || question.permite_foto || question.permite_video) && (
          <MediaAnalysisButton onOpenAnalysis={handleOpenAnalysis} />
        )}
      </div>

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
      />

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
    </div>
  );
}
