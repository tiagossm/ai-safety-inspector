
import React, { useCallback, useState, useEffect } from "react";
import { ResponseButtonGroup } from "./components/ResponseButtonGroup";
import { StandardActionButtons } from "../StandardActionButtons";
import { MediaUploadInput } from "@/components/inspection/question-inputs/MediaUploadInput";
import { MediaAnalysisDialog } from "@/components/media/MediaAnalysisDialog";
import { MediaAttachments } from "@/components/inspection/question-inputs/MediaAttachments";
import { MediaAnalysisResult, Plan5W2H } from "@/hooks/useMediaAnalysis";
import { ActionPlan5W2HDialog } from "@/components/action-plans/ActionPlan5W2HDialog";

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

// Sempre trabalhar com objeto plano
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
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null);
  const [mediaAnalysisResults, setMediaAnalysisResults] = useState<Record<string, MediaAnalysisResult>>(
    response?.mediaAnalysisResults || {}
  );
  const [isActionPlanDialogOpen, setIsActionPlanDialogOpen] = useState(false);
  const [ia5W2Hplan, setIa5W2Hplan] = useState<Plan5W2H | null>(null);

  // Extração segura dos valores — sempre plano!
  const currentValue = response?.value;
  const mediaUrls: string[] = Array.isArray(response?.mediaUrls)
    ? response.mediaUrls.filter((url: string) => typeof url === "string")
    : [];

  // Sincroniza resultados da IA somente quando de fato mudaram
  useEffect(() => {
    if (response?.mediaAnalysisResults) {
      const responseResultsString = JSON.stringify(response.mediaAnalysisResults);
      const localResultsString = JSON.stringify(mediaAnalysisResults);

      if (responseResultsString !== localResultsString) {
        setMediaAnalysisResults(response.mediaAnalysisResults);
      }
    }
    // eslint-disable-next-line
  }, [response?.mediaAnalysisResults]);

  // Handler flat para o campo value, nunca aninhar!
  const handleResponseChange = useCallback(
    (value: boolean) => {
      onResponseChange({ ...response, value });
    },
    [response, onResponseChange]
  );

  // Atualiza mediaUrls no objeto resposta, plano!
  const handleMediaChange = useCallback(
    (newMediaUrls: string[]) => {
      if (onMediaChange) {
        onMediaChange(newMediaUrls);
      } else {
        onResponseChange({ ...response, mediaUrls: newMediaUrls });
      }
    },
    [response, onResponseChange, onMediaChange]
  );

  // Salva resultado da IA no objeto plano de resposta.
  const handleAnalysisResults = useCallback(
    (mediaUrl: string, result: MediaAnalysisResult) => {
      // Não duplica se igual
      const existingResult = mediaAnalysisResults[mediaUrl];
      if (existingResult && JSON.stringify(existingResult) === JSON.stringify(result)) {
        return;
      }
      const updatedResults = { ...mediaAnalysisResults, [mediaUrl]: result };
      setMediaAnalysisResults(updatedResults);

      onResponseChange({
        ...response,
        mediaAnalysisResults: updatedResults,
      });
    },
    [mediaAnalysisResults, response, onResponseChange]
  );

  // Abrir modal análise somente por ação do usuário
  const handleOpenAnalysis = useCallback(() => {
    if (mediaUrls && mediaUrls.length > 0) {
      setSelectedMediaUrl(mediaUrls[0]);
      setIsAnalysisOpen(true);
    }
  }, [mediaUrls]);

  const handleOpenActionPlan = useCallback(() => {
    setIa5W2Hplan(null);
    setIsActionPlanDialogOpen(true);
  }, []);

  const handleAdd5W2HActionPlan = useCallback((plan: Plan5W2H) => {
    setIa5W2Hplan(plan);
    setIsActionPlanDialogOpen(true);
  }, []);

  // Ao deletar mídia, remove também análise correspondente
  const handleDeleteMedia = useCallback(
    (urlToDelete: string) => {
      const updatedMediaUrls = mediaUrls.filter((url) => url !== urlToDelete);
      handleMediaChange(updatedMediaUrls);

      const updatedResults = { ...mediaAnalysisResults };
      delete updatedResults[urlToDelete];
      setMediaAnalysisResults(updatedResults);

      onResponseChange({
        ...response,
        mediaUrls: updatedMediaUrls,
        mediaAnalysisResults: updatedResults,
      });
    },
    [mediaUrls, mediaAnalysisResults, response, handleMediaChange, onResponseChange]
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
        onOpenAnalysis={handleOpenAnalysis}
        onActionPlanClick={handleOpenActionPlan}
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
        analysisResults={mediaAnalysisResults}
      />

      {mediaUrls.length > 0 && (
        <MediaAttachments
          mediaUrls={mediaUrls}
          onDelete={!readOnly ? handleDeleteMedia : undefined}
          onOpenPreview={() => {}}
          onOpenAnalysis={handleOpenAnalysis}
          readOnly={readOnly}
          questionText={question.text || question.pergunta || ""}
          analysisResults={mediaAnalysisResults}
          onSaveAnalysis={handleAnalysisResults}
        />
      )}

      <MediaAnalysisDialog
        open={isAnalysisOpen}
        onOpenChange={setIsAnalysisOpen}
        mediaUrl={selectedMediaUrl}
        questionText={question.text || question.pergunta || ""}
        userAnswer={
          currentValue === true ? "Sim" : currentValue === false ? "Não" : ""
        }
        onAnalysisComplete={(result) => {
          if (selectedMediaUrl) {
            handleAnalysisResults(selectedMediaUrl, result);
          }
        }}
        multimodalAnalysis={true}
        additionalMediaUrls={mediaUrls.filter((url) => url !== selectedMediaUrl)}
        onAdd5W2HActionPlan={handleAdd5W2HActionPlan}
      />

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
        ia5W2Hplan={ia5W2Hplan}
      />
    </div>
  );
}
