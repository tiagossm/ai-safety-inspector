
import React from "react";
import { CommentSection } from "../question-components/CommentSection";
import { ActionPlanButton } from "../question-components/ActionPlanButton";

interface QuestionActionsProps {
  isCommentOpen: boolean;
  setIsCommentOpen: (isOpen: boolean) => void;
  comment: string;
  handleCommentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  hasNegativeResponse: boolean;
  isActionPlanOpen: boolean;
  setIsActionPlanOpen: (isOpen: boolean) => void;
}

export function QuestionActions({
  isCommentOpen,
  setIsCommentOpen,
  comment,
  handleCommentChange,
  hasNegativeResponse,
  isActionPlanOpen,
  setIsActionPlanOpen
}: QuestionActionsProps) {
  return (
    <div className="flex justify-between items-center mt-3">
      <CommentSection 
        isCommentOpen={isCommentOpen}
        setIsCommentOpen={setIsCommentOpen}
        comment={comment}
        handleCommentChange={handleCommentChange}
      />
      {hasNegativeResponse && (
        <ActionPlanButton 
          onActionPlanClick={() => setIsActionPlanOpen(!isActionPlanOpen)}
          readOnly={false}
        />
      )}
    </div>
  );
}
