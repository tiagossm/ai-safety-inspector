
/**
 * Versão com força de cache 2025-06-15 - UniqueKeyForProps
 * Se você vir esse comentário, está na versão correta da interface!!!
 */
import React, { useState, useCallback } from "react";
import { ActionPlanButton } from "./response-types/components/ActionPlanButton";
import { MediaAnalysisButton } from "./response-types/components/MediaAnalysisButton";
import { ActionPlan5W2HDialog } from "@/components/action-plans/ActionPlan5W2HDialog";
import { MediaAnalysisDialog } from "@/components/media/MediaAnalysisDialog";
import { MediaAnalysisResult, Plan5W2H } from "@/hooks/useMediaAnalysis";

/**
 * Interface oficial dos props dos botões universais
 * ATENÇÃO: Sempre importe diretamente desse arquivo, nunca de um barrel ou index.ts
 */
export interface StandardActionButtonsProps {
  question: any;
  inspectionId?: string;
  response?: any;
  actionPlan?: any;
  onSaveActionPlan?: (data: any) => Promise<void>;
  mediaUrls?: string[];
  readOnly?: boolean;
  mediaAnalysisResults?: Record<string, any>;
  onOpenAnalysis?: () => void;
  onActionPlanClick?: () => void;
  /** Não utilizar, apenas para forçar atualização de tipos! */
  dummyProp?: "UniqueKeyForProps20250615";
}

export function StandardActionButtons(props: StandardActionButtonsProps) {
  const {
    question,
    inspectionId,
    response,
    actionPlan,
    onSaveActionPlan,
    mediaUrls = [],
    readOnly = false,
    mediaAnalysisResults = {},
    onOpenAnalysis,
    onActionPlanClick,
  } = props;

  const [isActionPlanDialogOpen, setIsActionPlanDialogOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null);
  const [ia5W2Hplan, setIa5W2Hplan] = useState<Plan5W2H | null>(null);

  // Abertura do modal 5W2H
  const handleOpenActionPlan = useCallback(() => {
    if (onActionPlanClick) {
      onActionPlanClick();
    } else {
      setIa5W2Hplan(null);
      setIsActionPlanDialogOpen(true);
    }
  }, [onActionPlanClick]);

  // Abertura análise IA centralizada
  const handleOpenAnalysis = useCallback(() => {
    if (onOpenAnalysis) {
      onOpenAnalysis();
    } else if (mediaUrls && mediaUrls.length > 0) {
      setSelectedMediaUrl(mediaUrls[0]);
      setIsAnalysisOpen(true);
    }
  }, [onOpenAnalysis, mediaUrls]);

  const handleAdd5W2HActionPlan = useCallback((plan: Plan5W2H) => {
    setIa5W2Hplan(plan);
    setIsActionPlanDialogOpen(true);
  }, []);

  // Handler para salvar análise e atualizar response - corrigido para aceitar url e result
  const handleAnalysisComplete = useCallback((url: string, result: MediaAnalysisResult) => {
    if (selectedMediaUrl && response) {
      const updatedResults = { 
        ...mediaAnalysisResults, 
        [selectedMediaUrl]: result 
      };
      
      // Atualizar via response se disponível
      if (response.onResponseChange) {
        response.onResponseChange({
          ...response,
          mediaAnalysisResults: updatedResults
        });
      }
    }
  }, [selectedMediaUrl, mediaAnalysisResults, response]);

  return (
    <>
      <div className="flex flex-wrap gap-2 mt-2 mb-1">
        <ActionPlanButton
          onActionPlanClick={handleOpenActionPlan}
          readOnly={readOnly}
        />
        {(question?.allowsPhoto || question?.allowsVideo || question?.permite_foto || question?.permite_video) && (
          <MediaAnalysisButton onOpenAnalysis={handleOpenAnalysis} />
        )}
      </div>
      
      {/* Modal 5W2H quando não há handler externo */}
      {!onActionPlanClick && (
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
      )}

      {/* Modal de análise IA quando não há handler externo */}
      {!onOpenAnalysis && (
        <MediaAnalysisDialog
          open={isAnalysisOpen}
          onOpenChange={setIsAnalysisOpen}
          mediaUrl={selectedMediaUrl}
          questionText={question.text || question.pergunta || ""}
          userAnswer={
            response?.value === true ? "Sim" : 
            response?.value === false ? "Não" : ""
          }
          multimodalAnalysis={true}
          additionalMediaUrls={mediaUrls.filter((url) => url !== selectedMediaUrl)}
          onAnalysisComplete={handleAnalysisComplete}
          onAdd5W2HActionPlan={handleAdd5W2HActionPlan}
        />
      )}
    </>
  );
}
