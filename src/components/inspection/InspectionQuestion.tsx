
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuestionResponse } from "@/hooks/inspection/useQuestionResponse";
import { CommentDialog } from "./dialogs/CommentDialog";
import { ActionPlanDialog } from "./dialogs/ActionPlanDialog";
import { MediaDialog } from "./dialogs/MediaDialog";
import { MediaAttachments } from "./question-inputs/MediaAttachments";
import { ActionPlanSection } from "./question-inputs/ActionPlanSection";
import { QuestionHeader } from "./question-parts/QuestionHeader";
import { SubChecklistButton } from "./question-parts/SubChecklistButton";
import { QuestionActions } from "./question-parts/QuestionActions";
import { ResponseInputRenderer } from "./question-parts/ResponseInputRenderer";

// Import utility functions
import { 
  getAllowedAttachmentTypes, 
  shouldShowQuestion, 
  getQuestionCardClasses 
} from "./utils/questionUtils";

interface InspectionQuestionProps {
  question: any;
  index: number;
  response: any;
  onResponseChange: (data: any) => void;
  allQuestions: any[];
  onOpenSubChecklist?: () => void;
  numberLabel?: string;
  isSubQuestion?: boolean;
}

export function InspectionQuestion({
  question,
  index,
  response,
  onResponseChange,
  allQuestions,
  onOpenSubChecklist,
  numberLabel,
  isSubQuestion = false
}: InspectionQuestionProps) {
  const {
    commentDialogOpen,
    setCommentDialogOpen,
    actionPlanDialogOpen,
    setActionPlanDialogOpen,
    mediaDialogOpen,
    setMediaDialogOpen,
    commentText,
    setCommentText,
    actionPlanText,
    setActionPlanText,
    isActionPlanOpen,
    setIsActionPlanOpen,
    showCommentSection,
    setShowCommentSection,
    loadingSubChecklist,
    handleResponseValue,
    handleSaveComment,
    handleSaveActionPlan,
    handleMediaUploaded,
    handleOpenSubChecklist
  } = useQuestionResponse(question, response, onResponseChange);
  
  // Check if the question should be shown based on parent conditions
  if (!shouldShowQuestion(question, allQuestions, allQuestions.reduce((acc, q) => {
    if (acc[q.id]) return acc;
    return { ...acc, [q.id]: { value: response?.value } };
  }, {}))) return null;
  
  const isFollowUpQuestion = !!question.parentQuestionId;
  
  // Create the proper question number label
  const displayLabel = numberLabel || `${index + 1})`;
  
  // Apply indentation for sub-questions via CSS
  const indentationClass = isSubQuestion ? "ml-6" : "";
  
  return (
    <div>
      <Card className={`${getQuestionCardClasses(question, response)} ${indentationClass} mb-4`}>
        <CardContent className="p-3.5">
          <QuestionHeader
            question={question}
            index={index}
            isFollowUpQuestion={isFollowUpQuestion}
            response={response}
            showCommentSection={showCommentSection}
            setShowCommentSection={setShowCommentSection}
            numberLabel={displayLabel}
          />
          
          <div className="mt-2">
            <ResponseInputRenderer
              question={question}
              response={response}
              onResponseChange={handleResponseValue}
              onAddMedia={() => setMediaDialogOpen(true)}
            />
          </div>
          
          <SubChecklistButton
            hasSubChecklist={question.hasSubChecklist}
            loading={loadingSubChecklist}
            onOpenSubChecklist={() => handleOpenSubChecklist(onOpenSubChecklist)}
          />
          
          <MediaAttachments mediaUrls={response?.mediaUrls} />
          
          {(response?.value === "não" || isActionPlanOpen || response?.actionPlan) && (
            <ActionPlanSection
              isOpen={isActionPlanOpen}
              onOpenChange={setIsActionPlanOpen}
              actionPlan={response?.actionPlan}
              onActionPlanChange={(text) => {
                onResponseChange({
                  ...(response || {}),
                  actionPlan: text
                });
              }}
              onOpenDialog={() => {
                setActionPlanText(response?.actionPlan || "");
                setActionPlanDialogOpen(true);
              }}
              hasNegativeResponse={response?.value === "não"}
            />
          )}
          
          <QuestionActions
            response={response}
            onOpenCommentDialog={() => {
              setCommentText(response?.comment || "");
              setCommentDialogOpen(true);
            }}
            onOpenActionPlanDialog={() => {
              setActionPlanText(response?.actionPlan || "");
              setActionPlanDialogOpen(true);
            }}
            setIsActionPlanOpen={setIsActionPlanOpen}
          />
        </CardContent>
      </Card>
      
      <CommentDialog
        open={commentDialogOpen}
        onOpenChange={setCommentDialogOpen}
        questionText={question.text}
        commentText={commentText}
        setCommentText={setCommentText}
        onSave={handleSaveComment}
      />
      
      <ActionPlanDialog
        open={actionPlanDialogOpen}
        onOpenChange={setActionPlanDialogOpen}
        questionText={question.text}
        actionPlanText={actionPlanText}
        setActionPlanText={setActionPlanText}
        onSave={handleSaveActionPlan}
      />
      
      <MediaDialog
        open={mediaDialogOpen}
        onOpenChange={setMediaDialogOpen}
        onMediaUploaded={handleMediaUploaded}
        response={response}
        allowedTypes={getAllowedAttachmentTypes(question)}
      />
    </div>
  );
}
