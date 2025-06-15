
import React, { useState, useCallback } from "react";
import { ActionPlanButton } from "./response-types/components/ActionPlanButton";
import { MediaAnalysisButton } from "./response-types/components/MediaAnalysisButton";
import { ActionPlan5W2HDialog } from "@/components/action-plans/ActionPlan5W2HDialog";

// Interface precisa ser exportada explicitamente para as props ficarem claras no projeto
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
}

// Declarar props explicitamente tipadas para garantir TypeScript
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
