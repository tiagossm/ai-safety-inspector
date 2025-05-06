
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ResponseInputRenderer } from "./question-parts/ResponseInputRenderer";
import { ActionPlanSection } from "./question-parts/ActionPlanSection";
import { QuestionHeader } from "./question-components/QuestionHeader";
import { CommentSection } from "./question-components/CommentSection";
import { ActionPlanButton } from "./question-components/ActionPlanButton";
import { MediaControls } from "./question-components/MediaControls";
import { isNegativeResponse, normalizeResponseType } from "@/utils/inspection/normalizationUtils";
import { ActionPlanForm } from "@/components/action-plans/form/ActionPlanForm";
import { ActionPlanFormData } from "@/components/action-plans/form/types";
import { ActionPlan } from "@/services/inspection/actionPlanService";
import { Badge } from "@/components/ui/badge";

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
  
  // Use our centralized normalization utility for consistency
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
  
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Question ${question.id} media capabilities:`, { 
        allowsPhoto, 
        allowsVideo, 
        allowsAudio,
        allowsFiles,
        responseType: normalizedType
      });
    }
  }, [question.id, allowsPhoto, allowsVideo, allowsAudio, allowsFiles, normalizedType]);
  
  const handleValueChange = useCallback((value: any) => {
    setIsValid(!isRequired || (value !== undefined && value !== null && value !== ""));
    
    onResponseChange({
      ...response,
      value,
      comment
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
    console.log("Media URLs updated:", mediaUrls);
    
    onResponseChange({
      ...response,
      mediaUrls
    });
  }, [response, onResponseChange]);
  
  const shouldBeVisible = useCallback(() => {
    if (!question.parentQuestionId && !question.parent_item_id) {
      return true;
    }
    
    const parentId = question.parentQuestionId || question.parent_item_id;
    const parentQuestion = allQuestions.find(q => q.id === parentId);
    
    if (!parentQuestion) {
      return true;
    }
    
    return true;
  }, [question.parentQuestionId, question.parent_item_id, allQuestions]);
  
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
  
  if (!shouldBeVisible()) {
    return null;
  }
  
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
            
            <div className="flex flex-wrap gap-1">
              {isRequired && (
                <Badge variant="destructive" className="text-xs">Required</Badge>
              )}
              {allowsPhoto && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">Photo</Badge>
              )}
              {allowsVideo && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-200">Video</Badge>
              )}
              {allowsAudio && (
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600 border-purple-200">Audio</Badge>
              )}
            </div>
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
          
          <div className="flex justify-between items-center mt-3">
            <CommentSection 
              isCommentOpen={isCommentOpen}
              setIsCommentOpen={setIsCommentOpen}
              comment={comment}
              handleCommentChange={handleCommentChange}
            />
            
            {hasNegativeResponse && (
              <ActionPlanButton 
                isActionPlanOpen={isActionPlanOpen}
                setIsActionPlanOpen={setIsActionPlanOpen}
              />
            )}
          </div>
          
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
            <ActionPlanForm
              inspectionId={inspectionId}
              questionId={question.id}
              existingPlan={actionPlan ? {
                id: actionPlan.id,
                description: actionPlan.description,
                assignee: actionPlan.assignee || '',
                dueDate: actionPlan.due_date ? new Date(actionPlan.due_date) : undefined,
                priority: actionPlan.priority,
                status: actionPlan.status
              } : undefined}
              onSave={handleSaveActionPlan}
              trigger={<></>} // Empty trigger since we control opening manually
            />
          )}
        </div>
      </div>
    </div>
  );
});
