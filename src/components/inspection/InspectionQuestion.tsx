
import React, { useState } from "react";
import { ResponseInputRenderer } from "./question-parts/ResponseInputRenderer";
import { QuestionHeader } from "./question-parts/QuestionHeader";
import { QuestionFooter } from "./question-parts/QuestionFooter";
import { QuestionActions } from "./question-parts/QuestionActions";
import { ActionPlanInput } from "./question-parts/ActionPlanInput";
import { ActionPlanIndicator } from "./question-parts/ActionPlanIndicator";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface InspectionQuestionProps {
  question: any;
  index: number;
  response: any;
  onResponseChange: (data: any) => void;
  allQuestions: any[];
  numberLabel?: string;
  onOpenSubChecklist?: () => void;
  onAddMedia?: () => void;
  isSubQuestion?: boolean;
}

export const InspectionQuestion = ({
  question,
  index,
  response,
  onResponseChange,
  allQuestions,
  numberLabel,
  onOpenSubChecklist,
  onAddMedia,
  isSubQuestion = false
}: InspectionQuestionProps) => {
  const [showActionPlan, setShowActionPlan] = useState(!!response?.actionPlan);
  const [showCommentSection, setShowCommentSection] = useState(false);
  
  const toggleActionPlan = () => {
    setShowActionPlan(!showActionPlan);
  };
  
  const handleResponseChange = (value: any) => {
    onResponseChange({
      ...response,
      value
    });
  };
  
  const handleActionPlanChange = (text: string) => {
    onResponseChange({
      ...response,
      actionPlan: text
    });
  };
  
  // Get information about parent question if this is a child question
  const parentInfo = React.useMemo(() => {
    if (!question.parentQuestionId) return null;
    
    const parentQuestion = allQuestions.find(
      q => q.id === question.parentQuestionId
    );
    
    if (!parentQuestion) return null;
    
    return {
      text: parentQuestion.text,
      conditionValue: question.conditionValue
    };
  }, [question, allQuestions]);
  
  // Check if question should show warning about being mandatory
  const isUnanswered = question.isRequired && (!response || response.value === undefined);
  const hasValidationError = response?.validated === false;
  
  const isFollowUpQuestion = !!question.parentQuestionId;

  const onOpenCommentDialog = () => {
    setShowCommentSection(true);
  };

  const onOpenActionPlanDialog = () => {
    setShowActionPlan(true);
  };

  const setIsActionPlanOpen = (isOpen: boolean) => {
    setShowActionPlan(isOpen);
  };
  
  return (
    <Card 
      className={cn(
        "border shadow-sm", 
        parentInfo ? "border-l-4 border-l-blue-500" : "",
        isUnanswered ? "border-amber-300" : "",
        hasValidationError ? "border-red-300" : ""
      )}
    >
      <div className="p-4">
        {parentInfo && (
          <div className="mb-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
              Subitem da pergunta: "{parentInfo.text?.substring(0, 60)}{parentInfo.text && parentInfo.text.length > 60 ? "..." : ""}"
              {parentInfo.conditionValue && (
                <span className="ml-1">
                  {" "}
                  (quando "{parentInfo.conditionValue}")
                </span>
              )}
            </Badge>
          </div>
        )}
        
        <QuestionHeader 
          question={question} 
          index={index}
          numberLabel={numberLabel}
          response={response}
          isFollowUpQuestion={isFollowUpQuestion}
          showCommentSection={showCommentSection}
          setShowCommentSection={setShowCommentSection}
        />
        
        <div className="mt-3">
          <ResponseInputRenderer
            question={question}
            response={response}
            onResponseChange={handleResponseChange}
            onAddMedia={onAddMedia}
          />
        </div>
        
        {isUnanswered && (
          <div className="mt-2 flex items-center gap-1.5 text-amber-600 text-xs">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Esta pergunta precisa ser respondida</span>
          </div>
        )}
        
        {hasValidationError && (
          <div className="mt-2 flex items-center gap-1.5 text-red-600 text-xs">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>A resposta não atende aos critérios de validação</span>
          </div>
        )}
        
        {response?.value && (
          <ActionPlanIndicator
            responseValue={response.value}
            question={question}
            onClick={toggleActionPlan}
            hasActionPlan={!!response?.actionPlan}
          />
        )}
        
        {showActionPlan && (
          <div className="mt-3">
            <ActionPlanInput
              value={response?.actionPlan || ""}
              onChange={handleActionPlanChange}
              required={hasValidationError}
            />
          </div>
        )}
        
        <QuestionFooter question={question} />
        
        {question.hasSubChecklist && onOpenSubChecklist && (
          <QuestionActions 
            response={response}
            onOpenCommentDialog={onOpenCommentDialog}
            onOpenActionPlanDialog={onOpenActionPlanDialog}
            setIsActionPlanOpen={setIsActionPlanOpen}
            onOpenSubChecklist={onOpenSubChecklist}
          />
        )}
      </div>
    </Card>
  );
};
