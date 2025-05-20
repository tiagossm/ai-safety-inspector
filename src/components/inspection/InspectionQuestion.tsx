import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { QuestionHeader } from "./question-parts/QuestionHeader";
import { ResponseInput } from "./question-parts/ResponseInput";
import { CommentsSection } from "./question-parts/CommentsSection";
import { ActionPlanSection } from "./question-parts/ActionPlanSection";
import { MediaUploadSection } from "./question-inputs/MediaUploadSection";
import { ActionPlan } from '@/services/inspection/actionPlanService';
import { ActionPlanFormData } from '@/components/action-plans/form/types';
import { useMediaAnalysis, MediaAnalysisResult } from "@/hooks/useMediaAnalysis";
import { ActionPlanImplementation } from "./ActionPlanImplementation";
import { ActionPlanDialog } from "@/components/action-plans/ActionPlanDialog";

interface InspectionQuestionProps {
  question: any;
  index: number;
  response: any;
  onResponseChange: (data: any) => void;
  allQuestions?: any[];
  numberLabel?: string;
  inspectionId?: string;
  isSubQuestion?: boolean;
  actionPlan?: ActionPlan;
  onSaveActionPlan?: (data: ActionPlanFormData) => Promise<ActionPlan | void>;
  onOpenSubChecklist?: () => void;
}

export function InspectionQuestion({
  question,
  index,
  response,
  onResponseChange,
  allQuestions = [],
  numberLabel = "",
  inspectionId,
  isSubQuestion = false,
  actionPlan,
  onSaveActionPlan,
  onOpenSubChecklist
}: InspectionQuestionProps) {
  const [showComments, setShowComments] = useState(false);
  const [showActionPlan, setShowActionPlan] = useState(false);
  const [showActionPlanImplementation, setShowActionPlanImplementation] = useState(false);
  const [showActionPlanDialog, setShowActionPlanDialog] = useState(false);
  const [loadingSubChecklist, setLoadingSubChecklist] = useState(false);
  const [multiModalLoading, setMultiModalLoading] = useState(false);

  const [mediaAnalysisResults, setMediaAnalysisResults] = useState<Record<string, MediaAnalysisResult>>({});
  const { analyze, analyzing } = useMediaAnalysis();

  const [aiSuggestion, setAiSuggestion] = useState<string | undefined>();

  const handleCommentChange = (comment: string) => {
    onResponseChange({
      ...response,
      comment
    });
  };

  const handleActionPlanChange = (actionPlan: string) => {
    onResponseChange({
      ...response,
      actionPlan
    });
  };

  const handleResponseValueChange = (value: any) => {
    if (isNegativeResponse(value)) {
      setShowActionPlan(true);
    }
    onResponseChange({
      ...response,
      value
    });
  };

  const handleMediaChange = (mediaUrls: string[]) => {
    onResponseChange({
      ...response,
      mediaUrls,
    });
  };

  const isNegativeResponse = (value: any): boolean => {
    if (question.responseType === 'yes_no') {
      return value === false || value === 'no' || value === 'não';
    }
    return false;
  };

  const handleSaveAnalysis = (url: string, result: MediaAnalysisResult) => {
    setMediaAnalysisResults(prev => ({
      ...prev,
      [url]: result
    }));

    if (result.hasNonConformity) {
      setShowActionPlan(true);
      if (result.actionPlanSuggestion && (!response.actionPlan || response.actionPlan === "")) {
        handleActionPlanChange(result.actionPlanSuggestion);
      }
    }
  };

  // Chamada da IA para abrir o modal estruturado
  const handleApplyAISuggestion = (suggestion: string) => {
    console.log("handleApplyAISuggestion foi chamado com:", suggestion);
    if (!suggestion) return;
    setAiSuggestion(suggestion);
    setShowActionPlanDialog(true);
  };

  const handleAnalyzeAllMedia = async () => {
    if (!response.mediaUrls || response.mediaUrls.length <= 1) {
      console.log("Pelo menos 2 imagens são necessárias para análise em conjunto");
      return;
    }

    try {
      setMultiModalLoading(true);

      const result = await analyze({
        mediaUrl: response.mediaUrls[0],
        questionText: question.text,
        multimodalAnalysis: true,
        additionalMediaUrls: response.mediaUrls.slice(1)
      });

      if (result) {
        const updatedResults = {...mediaAnalysisResults};

        response.mediaUrls.forEach((url: string) => {
          updatedResults[url] = {
            ...result,
            questionText: question.text,
            hasNonConformity: result.hasNonConformity,
            psychosocialRiskDetected: result.psychosocialRiskDetected,
            actionPlanSuggestion: result.actionPlanSuggestion
          };
        });

        setMediaAnalysisResults(updatedResults);

        if (result.hasNonConformity) {
          setShowActionPlan(true);
          if (result.actionPlanSuggestion && (!response.actionPlan || response.actionPlan === "")) {
            handleActionPlanChange(result.actionPlanSuggestion);
          }
        }
      }
    } catch (error) {
      console.error("Error in multi-modal analysis:", error);
    } finally {
      setMultiModalLoading(false);
    }
  };

  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  const handleOpenActionPlanDialog = () => {
    setShowActionPlanDialog(true);
  };

  const handleOpenSubChecklist = () => {
    if (onOpenSubChecklist) {
      setLoadingSubChecklist(true);
      try {
        onOpenSubChecklist();
      } finally {
        setLoadingSubChecklist(false);
      }
    }
  };

  const getAISuggestions = (): string[] => {
    const suggestions: string[] = [];
    Object.values(mediaAnalysisResults).forEach(result => {
      if (result?.actionPlanSuggestion && !suggestions.includes(result.actionPlanSuggestion)) {
        suggestions.push(result.actionPlanSuggestion);
      }
    });
    return suggestions;
  };

  const handleSaveStructuredActionPlan = async (data: ActionPlanFormData) => {
    if (onSaveActionPlan) {
      try {
        const result = await onSaveActionPlan(data);
        if (result) {
          setShowActionPlanImplementation(true);
          setShowActionPlanDialog(false);
          console.log("Plano de ação salvo com sucesso:", result);
        }
        return result;
      } catch (error) {
        console.error("Erro ao salvar plano de ação:", error);
        return undefined;
      }
    }
  };

  useEffect(() => {
    if (response && isNegativeResponse(response.value)) {
      setShowActionPlan(true);
    }
    if (response && response.actionPlan) {
      setShowActionPlan(true);
    }
    if (actionPlan && inspectionId && question.id) {
      setShowActionPlanImplementation(true);
    }
  }, [response, actionPlan, inspectionId, question.id]);

  const getBestAISuggestion = (): string | undefined => {
    const suggestions = Object.values(mediaAnalysisResults)
      .map(result => result?.actionPlanSuggestion)
      .filter(Boolean);
    return suggestions.length > 0 ? suggestions[0] : undefined;
  };

  return (
    <Card className={isSubQuestion ? "border-gray-200 bg-gray-50" : ""}>
      <CardHeader className="py-3 px-4">
        <QuestionHeader 
          question={question} 
          index={index}
          numberLabel={numberLabel}
          showComments={showComments}
          onToggleComments={handleToggleComments}
          hasSubChecklist={question.hasSubChecklist}
          loadingSubChecklist={loadingSubChecklist}
          onOpenSubChecklist={handleOpenSubChecklist}
        />
      </CardHeader>
      <CardContent className="py-3 px-4">
        <ResponseInput
          question={question}
          value={response?.value}
          onChange={handleResponseValueChange}
        />
        {showComments && (
          <CommentsSection
            comment={response?.comment || ""}
            onCommentChange={handleCommentChange}
          />
        )}
        {response?.mediaUrls && response.mediaUrls.length > 0 && (
          <div className="mt-4">
            <MediaUploadSection
              mediaUrls={response.mediaUrls || []}
              onMediaChange={handleMediaChange}
              questionId={question.id}
              inspectionId={inspectionId}
              isReadOnly={false}
              questionText={question.text}
              onSaveAnalysis={handleSaveAnalysis}
              onApplyAISuggestion={handleApplyAISuggestion}
              analysisResults={mediaAnalysisResults}
              onAnalyzeAll={handleAnalyzeAllMedia}
              multiModalLoading={multiModalLoading}
            />
          </div>
        )}
        {(isNegativeResponse(response?.value) || showActionPlan || response?.actionPlan) && !showActionPlanImplementation && (
          <ActionPlanSection
            isOpen={showActionPlan}
            onOpenChange={setShowActionPlan}
            actionPlan={response?.actionPlan || ""}
            onActionPlanChange={handleActionPlanChange}
            onOpenDialog={inspectionId && question.id ? handleOpenActionPlanDialog : undefined}
            hasNegativeResponse={isNegativeResponse(response?.value)}
            aiSuggestion={getBestAISuggestion()}
            mediaAnalysisResults={mediaAnalysisResults}
          />
        )}
        {inspectionId && question.id && onSaveActionPlan && (
          <ActionPlanDialog
            open={showActionPlanDialog}
            onOpenChange={setShowActionPlanDialog}
            inspectionId={inspectionId}
            questionId={question.id}
            existingPlan={actionPlan}
            onSave={handleSaveStructuredActionPlan}
            aiSuggestion={aiSuggestion}
          />
        )}
        {showActionPlanImplementation && inspectionId && question.id && onSaveActionPlan && actionPlan && (
          <div className="mt-4 pt-4 border-t border-dashed">
            <ActionPlanImplementation
              inspectionId={inspectionId}
              questionId={question.id}
              questionText={question.text || ""}
              actionPlans={[actionPlan]}
              loading={false}
              onSaveActionPlan={handleSaveStructuredActionPlan}
              aiSuggestions={getAISuggestions()}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
