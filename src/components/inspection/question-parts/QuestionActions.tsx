
import React from "react";
import { CommentSection } from "../question-components/CommentSection";
import { ActionPlanButton } from "../question-components/ActionPlanButton";

interface QuestionActionsProps {
  isCommentOpen: boolean;
  setIsCommentOpen: (isOpen: boolean) => void;
  comment: string;
  handleCommentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  hasNegativeResponse: boolean; // Não vamos usar essa propriedade mais
  isActionPlanOpen: boolean;
  setIsActionPlanOpen: (isOpen: boolean) => void;
}

export function QuestionActions({
  isCommentOpen,
  setIsCommentOpen,
  comment,
  handleCommentChange,
  hasNegativeResponse, // Mantemos para não quebrar a interface
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
      {/* Removemos a verificação de hasNegativeResponse para mostrar sempre o botão */}
      <ActionPlanButton 
        onActionPlanClick={() => setIsActionPlanOpen(!isActionPlanOpen)}
        readOnly={false}
      />
    </div>
  );
}
