
import React, { useState, useCallback, useMemo } from "react";
import { ResponseInputRenderer } from "./question-parts/ResponseInputRenderer";
import { ActionPlanSection } from "./question-parts/ActionPlanSection";
import { QuestionHeader } from "./question-components/QuestionHeader";
import { QuestionBadges } from "./question-parts/QuestionBadges";
import { QuestionActions } from "./question-parts/QuestionActions";
import { ActionPlanFormSection } from "./question-parts/ActionPlanFormSection";
import { useQuestionVisibility } from "./hooks/useQuestionVisibility";
import { isNegativeResponse, normalizeResponseType } from "@/utils/inspection/normalizationUtils";
import { ActionPlanFormData } from "@/components/action-plans/form/types";
import { ActionPlan } from "@/services/inspection/actionPlanService";

interface InspectionQuestionProps {
  question: any;
  index: number;
  response: any;
  onResponseChange: (data: any) => void;
  allQuestions: any[];
  numberLabel?: string;
  isSubQuestion?: boolean;
  onOpenSubChecklist?: () => void;
  inspectionId?: string;
  actionPlan?: ActionPlan;
  onSaveActionPlan?: (data: ActionPlanFormData) => Promise<ActionPlan | void>;
}

export const InspectionQuestion = React.memo(function InspectionQuestion({
  question,
  index,
  response,
  onResponseChange,
  allQuestions,
  numberLabel,
  isSubQuestion = false,
  onOpenSubChecklist,
  inspectionId,
  actionPlan,
  onSaveActionPlan
}: InspectionQuestionProps) {
  const [comment, setComment] = useState(response?.comment || "");
  const [isActionPlanOpen, setIsActionPlanOpen] = useState(false);
  const [isValid, setIsValid] = useState(!question.isRequired);
  const [isCommentOpen, setIsCommentOpen] = useState(!!response?.comment);
  const [showActionPlanDialog, setShowActionPlanDialog] = useState(false);

  const { shouldBeVisible } = useQuestionVisibility(question, allQuestions);

  const normalizedType = useMemo(() => {
    return normalizeResponseType(question.responseType || question.tipo_resposta || "");
  }, [question.responseType, question.tipo_resposta]);

  const questionText = question.text || question.pergunta || "";
  const isRequired = question.isRequired !== undefined ? question.isRequired : question.obrigatorio;
  const hasSubChecklist = question.hasSubChecklist || false;

  const allowsPhoto = question.allowsPhoto || question.permite_foto || false;
  const allowsVideo = question.allowsVideo || question.permite_video || false;
  const allowsAudio = question.allowsAudio || question.permite_audio || false;
  const allowsFiles = question.allowsFiles || question.permite_files || false;

  const handleValueChange = useCallback((value: any) => {
    console.log('InspectionQuestion: handleValueChange called with:', value);
    setIsValid(!isRequired || (value !== undefined && value !== null && value !== ""));
    onResponseChange({
      ...response,
      value: value?.value ?? value,
      comment: value?.comment ?? comment,
      actionPlan: value?.actionPlan ?? response?.actionPlan,
      mediaUrls: value?.mediaUrls ?? response?.mediaUrls ?? [],
      mediaAnalysisResults: value?.mediaAnalysisResults ?? response?.mediaAnalysisResults ?? {},
      subChecklistResponses: value?.subChecklistResponses ?? response?.subChecklistResponses ?? {},
    });
  }, [isRequired, response, comment, onResponseChange]);

  const handleCommentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
    onResponseChange({
      ...response,
      comment: e.target.value
    });
  }, [response, onResponseChange]);

  const handleActionPlanChange = useCallback((actionPlan: string) => {
    onResponseChange({
      ...response,
      actionPlan
    });
  }, [response, onResponseChange]);

  const handleMediaChange = useCallback((mediaUrls: string[]) => {
    console.log('InspectionQuestion: handleMediaChange called with:', mediaUrls);
    onResponseChange({
      ...response,
      mediaUrls
    });
  }, [response, onResponseChange]);

  const hasNegativeResponse = useMemo(() => {
    return isNegativeResponse(response?.value);
  }, [response?.value]);

  const handleOpenActionPlanDialog = useCallback(() => {
    setShowActionPlanDialog(true);
  }, []);

  const handleSaveActionPlan = useCallback(async (data: ActionPlanFormData) => {
    if (onSaveActionPlan) {
      await onSaveActionPlan(data);
    }
    setShowActionPlanDialog(false);
  }, [onSaveActionPlan]);

  if (!shouldBeVisible()) return null;

  return (
    <div className={`relative border rounded-lg p-4 mb-4 ${!isValid && response?.value !== undefined ? 'border-l-4 border-l-red-500' : ''}`}>
      <div className="flex items-start gap-2">
        <div className="font-medium min-w-[24px] mt-0.5">{numberLabel || (index + 1)}</div>
        <div className="flex-1">
          <div className="flex justify-between mb-2">
            <QuestionHeader 
              questionText={questionText} 
              numberLabel={numberLabel || (index + 1)}
              index={index}
              hasSubChecklist={hasSubChecklist}
              onOpenSubChecklist={onOpenSubChecklist}
            />
            <QuestionBadges 
              isRequired={isRequired}
              allowsPhoto={allowsPhoto}
              allowsVideo={allowsVideo}
              allowsAudio={allowsAudio}
              allowsFiles={allowsFiles}
            />
          </div>

          <div className="mt-2">
            <ResponseInputRenderer
              question={question}
              response={response}
              onResponseChange={handleValueChange}
              onMediaChange={handleMediaChange}
              inspectionId={inspectionId}
              actionPlan={actionPlan}
              onSaveActionPlan={handleSaveActionPlan}
            />
          </div>

          <QuestionActions
            isCommentOpen={isCommentOpen}
            setIsCommentOpen={setIsCommentOpen}
            comment={comment}
            handleCommentChange={handleCommentChange}
            hasNegativeResponse={hasNegativeResponse}
            isActionPlanOpen={isActionPlanOpen}
            setIsActionPlanOpen={setIsActionPlanOpen}
          />

          {hasNegativeResponse && inspectionId && question.id && (
            <ActionPlanSection
              isOpen={isActionPlanOpen}
              onOpenChange={setIsActionPlanOpen}
              actionPlan={actionPlan || response?.actionPlan}
              onActionPlanChange={handleActionPlanChange}
              onOpenDialog={handleOpenActionPlanDialog}
              hasNegativeResponse={hasNegativeResponse}
            />
          )}

          {hasNegativeResponse && inspectionId && question.id && onSaveActionPlan && (
            <ActionPlanFormSection
              inspectionId={inspectionId}
              questionId={question.id}
              actionPlan={actionPlan}
              onSaveActionPlan={handleSaveActionPlan}
            />
          )}
        </div>
      </div>
    </div>
  );
});
