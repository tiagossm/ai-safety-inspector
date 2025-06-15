import React, { useCallback, useState, useEffect } from "react";
import { ResponseButtonGroup } from "./components/ResponseButtonGroup";
import { StandardActionButtons, StandardActionButtonsProps } from "../StandardActionButtons";
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
  const [mediaAnalysisResults, setMediaAnalysisResults] = useState<Record<string, MediaAnalysisResult>>(
    response?.mediaAnalysisResults || {}
  );
  const [isActionPlanDialogOpen, setIsActionPlanDialogOpen] = useState(false);
  const [ia5W2Hplan, setIa5W2Hplan] = useState<Plan5W2H | null>(null);


  const currentValue = response?.value;
  const mediaUrls = response?.mediaUrls || [];

  // Sincroniza apenas quando os resultados do response mudaram efetivamente
  useEffect(() => {
    if (response?.mediaAnalysisResults) {
      const responseResultsString = JSON.stringify(response.mediaAnalysisResults);
      const localResultsString = JSON.stringify(mediaAnalysisResults);
      
      if (responseResultsString !== localResultsString) {
        setMediaAnalysisResults(response.mediaAnalysisResults);
      }
    }
  }, [response?.mediaAnalysisResults, mediaAnalysisResults]);

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

  // Handler corrigido para salvar resultados da análise com a ordem correta dos parâmetros
  const handleAnalysisResults = useCallback((mediaUrl: string, result: MediaAnalysisResult) => {
    // Evita atualizações desnecessárias verificando se o resultado mudou
    const existingResult = mediaAnalysisResults[mediaUrl];
    if (existingResult && JSON.stringify(existingResult) === JSON.stringify(result)) {
      return; // Nenhuma mudança, não atualiza
    }

    const updatedResults = { ...mediaAnalysisResults, [mediaUrl]: result };
    setMediaAnalysisResults(updatedResults);
    
    const updatedResponse = {
      ...response,
      mediaAnalysisResults: updatedResults
    };
    onResponseChange(updatedResponse);
  }, [mediaAnalysisResults, response, onResponseChange]);

  // Abre modal de análise apenas por ação manual do usuário
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

  const handleDeleteMedia = useCallback((urlToDelete: string) => {
    const updatedMediaUrls = mediaUrls.filter(url => url !== urlToDelete);
    handleMediaChange(updatedMediaUrls);
    
    // Remove também o resultado da análise correspondente
    const updatedResults = { ...mediaAnalysisResults };
    delete updatedResults[urlToDelete];
    setMediaAnalysisResults(updatedResults);
    
    const updatedResponse = {
      ...response,
      mediaUrls: updatedMediaUrls,
      mediaAnalysisResults: updatedResults
    };
    onResponseChange(updatedResponse);
  }, [mediaUrls, mediaAnalysisResults, response, handleMediaChange, onResponseChange]);

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
        userAnswer={currentValue === true ? "Sim" : currentValue === false ? "Não" : ""}
        onAnalysisComplete={(result) => {
          if (selectedMediaUrl) {
            handleAnalysisResults(selectedMediaUrl, result);
          }
        }}
        multimodalAnalysis={true}
        additionalMediaUrls={mediaUrls.filter(url => url !== selectedMediaUrl)}
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
