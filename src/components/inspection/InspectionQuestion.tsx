
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { QuestionHeader } from "./question-parts/QuestionHeader";
import { ResponseInput } from "./question-parts/ResponseInput";
import { CommentsSection } from "./question-parts/CommentsSection";
import { ActionPlanSection } from "./question-parts/ActionPlanSection";
import { MediaUploadSection } from "./question-inputs/MediaUploadSection";
import { ActionPlan } from '@/services/inspection/actionPlanService';
import { ActionPlanFormData } from '@/components/action-plans/form/types';
import { useMediaAnalysis, MediaAnalysisResult } from "@/hooks/useMediaAnalysis";

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
  const [loadingSubChecklist, setLoadingSubChecklist] = useState(false);
  const [multiModalLoading, setMultiModalLoading] = useState(false);
  
  // Track media analysis results
  const [mediaAnalysisResults, setMediaAnalysisResults] = useState<Record<string, MediaAnalysisResult>>({});
  
  // Get the analyze function
  const { analyze, analyzing } = useMediaAnalysis();

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
    // If the response has changed to negative, show the action plan section
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
      mediaUrls
    });
  };

  const isNegativeResponse = (value: any): boolean => {
    // Check if this is a negative response based on the question type
    if (question.responseType === 'yes_no') {
      return value === false || value === 'no' || value === 'não';
    }
    
    // For other question types, they might have custom "negative" values
    return false;
  };

  const handleSaveAnalysis = (url: string, result: MediaAnalysisResult) => {
    console.log("Saving analysis for URL:", url, result);
    
    setMediaAnalysisResults(prev => ({
      ...prev,
      [url]: result
    }));
    
    // If it's a non-conformity and action plan section isn't shown yet, show it
    if (result.hasNonConformity) {
      setShowActionPlan(true);
    }
  };

  const handleApplyAISuggestion = (suggestion: string) => {
    if (!suggestion) return;
    
    handleActionPlanChange(suggestion);
  };

  // Handle multi-modal analysis of all media for the question
  const handleAnalyzeAllMedia = async () => {
    // Only proceed if we have media URLs
    if (!response.mediaUrls || response.mediaUrls.length === 0) return;
    
    try {
      setMultiModalLoading(true);
      
      const result = await analyze({
        mediaUrls: response.mediaUrls, 
        questionText: question.text,
        responseValue: response.value,
        multimodal: true
      });
      
      // If the analysis was successful, save it for each media URL
      if (result) {
        const updatedResults = {...mediaAnalysisResults};
        
        // Apply the relevant parts of the multimodal analysis to each media URL
        response.mediaUrls.forEach((url: string) => {
          updatedResults[url] = {
            ...result,
            type: 'multimodal',
            questionText: question.text,
            hasNonConformity: result.hasNonConformity,
            psychosocialRiskDetected: result.psychosocialRiskDetected,
            actionPlanSuggestion: result.actionPlanSuggestion
          };
        });
        
        setMediaAnalysisResults(updatedResults);
        
        // If it's a non-conformity and action plan section isn't shown yet, show it
        if (result.hasNonConformity) {
          setShowActionPlan(true);
        }
      }
    } catch (error) {
      console.error("Error in multi-modal analysis:", error);
    } finally {
      setMultiModalLoading(false);
    }
  };

  return (
    <Card className={isSubQuestion ? "border-gray-200 bg-gray-50" : ""}>
      <CardHeader className="py-3 px-4">
        <QuestionHeader 
          question={question} 
          index={index}
          numberLabel={numberLabel}
          showComments={showComments}
          onToggleComments={() => setShowComments(!showComments)}
          hasSubChecklist={question.hasSubChecklist}
          loadingSubChecklist={loadingSubChecklist}
          onOpenSubChecklist={onOpenSubChecklist}
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
        
        {(isNegativeResponse(response?.value) || showActionPlan) && (
          <ActionPlanSection
            isOpen={showActionPlan}
            onOpenChange={setShowActionPlan}
            actionPlan={actionPlan || response?.actionPlan || ""}
            onActionPlanChange={handleActionPlanChange}
            onOpenDialog={() => {}} // We'll implement this later if needed
            hasNegativeResponse={isNegativeResponse(response?.value)}
            aiSuggestion={Object.values(mediaAnalysisResults)[0]?.actionPlanSuggestion}
            mediaAnalysisResults={mediaAnalysisResults}
          />
        )}
      </CardContent>
    </Card>
  );
}
