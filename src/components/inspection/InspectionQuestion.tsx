import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ResponseInputRenderer } from "./question-parts/ResponseInputRenderer";
import { ActionPlanSection } from "./question-inputs/ActionPlanSection";
import { QuestionHeader } from "./question-components/QuestionHeader";
import { CommentSection } from "./question-components/CommentSection";
import { ActionPlanButton } from "./question-components/ActionPlanButton";
import { MediaControls } from "./question-components/MediaControls";
import { normalizeResponseType } from "@/utils/inspection/normalizationUtils";

interface InspectionQuestionProps {
  question: any;
  index: number;
  response: any;
  onResponseChange: (data: any) => void;
  allQuestions: any[];
  numberLabel?: string;
  isSubQuestion?: boolean;
  onOpenSubChecklist?: () => void;
}

export const InspectionQuestion = React.memo(function InspectionQuestion({
  question,
  index,
  response,
  onResponseChange,
  allQuestions,
  numberLabel,
  isSubQuestion = false,
  onOpenSubChecklist
}: InspectionQuestionProps) {
  const [comment, setComment] = useState(response?.comment || "");
  const [isActionPlanOpen, setIsActionPlanOpen] = useState(false);
  const [isValid, setIsValid] = useState(!question.isRequired);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  
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
  
  const handleAddMedia = useCallback(() => {
    console.log("Attempting to add media to question:", question.id);
    
    const mediaUrls = response?.mediaUrls || [];
    const mockMediaUrl = `https://placehold.co/300x200?text=Media+${mediaUrls.length + 1}`;
    
    onResponseChange({
      ...response,
      mediaUrls: [...mediaUrls, mockMediaUrl]
    });
  }, [question.id, response, onResponseChange]);
  
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
  
  if (!shouldBeVisible()) {
    return null;
  }
  
  const hasNegativeResponse = 
    response?.value === false || 
    response?.value === "false" || 
    response?.value === "não" || 
    response?.value === "nao" || 
    response?.value === "no";
  
  return (
    <div className={`relative ${!isValid && response?.value !== undefined ? 'border-l-4 border-l-red-500 pl-2' : ''}`}>
      <div className="flex items-start gap-2">
        <div className="font-medium min-w-[24px] mt-0.5">{numberLabel || (index + 1)}</div>
        <div className="flex-1">
          <QuestionHeader 
            questionText={questionText} 
            numberLabel={numberLabel || (index + 1)}
            index={index}
            hasSubChecklist={hasSubChecklist}
            onOpenSubChecklist={onOpenSubChecklist}
          />
          
          <div className="mt-2">
            <ResponseInputRenderer
              question={question}
              response={response}
              onResponseChange={handleValueChange}
              onAddMedia={handleAddMedia}
            />
          </div>
          
          <MediaControls
            allowsPhoto={allowsPhoto}
            allowsVideo={allowsVideo}
            allowsAudio={allowsAudio}
            allowsFiles={allowsFiles}
            handleAddMedia={handleAddMedia}
          />
          
          <div className="flex justify-between items-center mt-3">
            <CommentSection 
              isCommentOpen={isCommentOpen}
              setIsCommentOpen={setIsCommentOpen}
              comment={comment}
              handleCommentChange={handleCommentChange}
            />
            
            <ActionPlanButton 
              isActionPlanOpen={isActionPlanOpen}
              setIsActionPlanOpen={setIsActionPlanOpen}
            />
          </div>
          
          <ActionPlanSection
            isOpen={isActionPlanOpen}
            onOpenChange={setIsActionPlanOpen}
            actionPlan={response?.actionPlan}
            onActionPlanChange={handleActionPlanChange}
            onOpenDialog={() => {}} // Implement if needed
            hasNegativeResponse={hasNegativeResponse}
          />
        </div>
      </div>
    </div>
  );
});
