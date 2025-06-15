
/**
 * Versão com força de cache 2025-06-15 - UniqueKeyForProps
 * Se você vir esse comentário, está na versão correta da interface!!!
 */
import React, { useState, useCallback } from "react";
import { ActionPlanButton } from "./response-types/components/ActionPlanButton";
import { MediaAnalysisButton } from "./response-types/components/MediaAnalysisButton";
import { ActionPlan5W2HDialog } from "@/components/action-plans/ActionPlan5W2HDialog";

// ADICIONA PROPRIEDADE 'dummyProp' para forçar a build invalidar completamente
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    dummyProp, // Forçar TypeScript a perceber mudança
  } = props;

  const [isActionPlanDialogOpen, setIsActionPlanDialogOpen] = useState(false);

  // Abertura do modal 5W2H
  const handleOpenActionPlan = useCallback(() => {
    if (onActionPlanClick) {
      onActionPlanClick();
    } else {
      setIsActionPlanDialogOpen(true);
    }
  }, [onActionPlanClick]);

  // Abertura análise IA (prop pode vir injetada ou não)
  const handleOpenAnalysis = useCallback(() => {
    if (onOpenAnalysis) onOpenAnalysis();
  }, [onOpenAnalysis]);

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
        {/* Mais botões universais futuramente aqui */}
      </div>
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
        />
      )}
    </>
  );
}

