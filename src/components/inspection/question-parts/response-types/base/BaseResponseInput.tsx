import React, { useState, useCallback } from "react";
import { MediaUploadInput } from "@/components/inspection/question-inputs/MediaUploadInput";
import { MediaAttachments } from "@/components/inspection/question-inputs/MediaAttachments";
import { ActionPlanButton } from "../components/ActionPlanButton";
import { MediaAnalysisButton } from "../components/MediaAnalysisButton";
import { MediaAnalysisDialog } from "@/components/media/MediaAnalysisDialog";
import { ActionPlan5W2HDialog } from "@/components/action-plans/ActionPlan5W2HDialog";
import { ResponseWrapper } from "../components/ResponseWrapper";
import { standardizeQuestion, standardizeResponse } from "@/utils/responseTypeStandardization";

interface BaseResponseInputProps {
  question: any;
  response: any;
  onResponseChange: (data: any) => void;
  inspectionId?: string;
  actionPlan?: any;
  onSaveActionPlan?: (data: any) => Promise<void>;
  onMediaChange?: (mediaUrls: string[]) => void;
  onApplyAISuggestion?: (suggestion: string) => void;
  readOnly?: boolean;
  children: React.ReactNode;
  showActionPlan?: boolean;
  showMediaAnalysis?: boolean;
  showMediaUpload?: boolean;
}

export function BaseResponseInput({
  question,
  response,
  onResponseChange,
  inspectionId,
  actionPlan,
  onSaveActionPlan,
  onMediaChange,
  onApplyAISuggestion,
  readOnly = false,
  children,
  showActionPlan = true,
  showMediaAnalysis = true,
  showMediaUpload = true
}: BaseResponseInputProps) {
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isActionPlanDialogOpen, setIsActionPlanDialogOpen] = useState(false);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null);
  const [mediaAnalysisResults, setMediaAnalysisResults] = useState<Record<string, any>>(
    response?.mediaAnalysisResults || {}
  );

  // Padronizar questão e resposta
  const standardQuestion = standardizeQuestion(question);
  const standardResponse = standardizeResponse(response);
  const mediaUrls = standardResponse.mediaUrls;

  const handleMediaChange = useCallback((newMediaUrls: string[]) => {
    const updatedResponse = {
      ...standardResponse,
      mediaUrls: newMediaUrls
    };
    
    onResponseChange(updatedResponse);
    
    if (onMediaChange) {
      onMediaChange(newMediaUrls);
    }
  }, [standardResponse, onResponseChange, onMediaChange]);

  const handleSaveAnalysis = useCallback((url: string, result: any) => {
    const newResults = {
      ...mediaAnalysisResults,
      [url]: result
    };
    
    setMediaAnalysisResults(newResults);
    
    const updatedResponse = {
      ...standardResponse,
      mediaAnalysisResults: newResults
    };
    
    onResponseChange(updatedResponse);
  }, [mediaAnalysisResults, standardResponse, onResponseChange]);

  const handleDeleteMedia = useCallback((urlToDelete: string) => {
    const updatedMediaUrls = mediaUrls.filter(url => url !== urlToDelete);
    handleMediaChange(updatedMediaUrls);
  }, [mediaUrls, handleMediaChange]);

  const handleOpenAnalysis = useCallback(() => {
    if (mediaUrls.length > 0) {
      setSelectedMediaUrl(mediaUrls[0]);
    } else {
      setSelectedMediaUrl(null);
    }
    setIsAnalysisOpen(true);
  }, [mediaUrls]);

  const handleOpenMediaAnalysis = useCallback((url: string) => {
    setSelectedMediaUrl(url);
    setIsAnalysisOpen(true);
  }, []);

  const handleOpenPreview = useCallback((url: string) => {
    // Implementar preview se necessário
  }, []);

  const hasMediaSupport = standardQuestion.allowsPhoto || 
                         standardQuestion.allowsVideo || 
                         standardQuestion.allowsAudio || 
                         standardQuestion.allowsFiles;

  const userAnswer = standardResponse.value?.toString() || "";

  return (
    <ResponseWrapper>
      <div className="space-y-4">
        {/* Renderizar o input específico do tipo de resposta */}
        {children}

        {/* Botões de ação */}
        {(showActionPlan || (showMediaAnalysis && hasMediaSupport)) && (
          <div className="flex flex-wrap gap-2">
            {showActionPlan && (
              <ActionPlanButton
                onActionPlanClick={() => setIsActionPlanDialogOpen(true)}
                readOnly={readOnly}
              />
            )}
            {showMediaAnalysis && hasMediaSupport && (
              <MediaAnalysisButton onOpenAnalysis={handleOpenAnalysis} />
            )}
          </div>
        )}

        {/* Upload de mídia */}
        {showMediaUpload && hasMediaSupport && (
          <MediaUploadInput
            mediaUrls={mediaUrls}
            onMediaChange={handleMediaChange}
            allowsPhoto={standardQuestion.allowsPhoto}
            allowsVideo={standardQuestion.allowsVideo}
            allowsAudio={standardQuestion.allowsAudio}
            allowsFiles={standardQuestion.allowsFiles}
            readOnly={readOnly}
            questionText={standardQuestion.pergunta}
            onSaveAnalysis={handleSaveAnalysis}
            analysisResults={mediaAnalysisResults}
            onApplyAISuggestion={onApplyAISuggestion}
          />
        )}

        {/* Anexos de mídia */}
        {mediaUrls.length > 0 && (
          <MediaAttachments
            mediaUrls={mediaUrls}
            onDelete={!readOnly ? handleDeleteMedia : undefined}
            onOpenPreview={handleOpenPreview}
            onOpenAnalysis={handleOpenMediaAnalysis}
            readOnly={readOnly}
            questionText={standardQuestion.pergunta}
            analysisResults={mediaAnalysisResults}
            onSaveAnalysis={handleSaveAnalysis}
            onApplyAISuggestion={onApplyAISuggestion}
          />
        )}

        {/* Modal de análise de mídia */}
        <MediaAnalysisDialog
          open={isAnalysisOpen}
          onOpenChange={setIsAnalysisOpen}
          mediaUrl={selectedMediaUrl}
          questionText={standardQuestion.pergunta}
          userAnswer={userAnswer}
          onAnalysisComplete={(results) => {
            setMediaAnalysisResults(prev => ({ ...prev, ...results }));
            const updatedResponse = {
              ...standardResponse,
              mediaAnalysisResults: { ...mediaAnalysisResults, ...results }
            };
            onResponseChange(updatedResponse);
          }}
          multimodalAnalysis={true}
          additionalMediaUrls={mediaUrls}
        />

        {/* Modal de plano de ação */}
        <ActionPlan5W2HDialog
          open={isActionPlanDialogOpen}
          onOpenChange={setIsActionPlanDialogOpen}
          questionId={standardQuestion.id}
          inspectionId={inspectionId}
          existingPlan={actionPlan}
          onSave={async (data: any) => {
            await onSaveActionPlan?.(data);
            setIsActionPlanDialogOpen(false);
          }}
          iaSuggestions={mediaAnalysisResults}
        />
      </div>
    </ResponseWrapper>
  );
}