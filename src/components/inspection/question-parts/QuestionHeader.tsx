
import React from "react";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, MessageSquare } from "lucide-react";
import { SubChecklistButton } from "./SubChecklistButton";

interface QuestionHeaderProps {
  question: any;
  index: number;
  numberLabel?: string;
  showComments: boolean;
  onToggleComments: () => void;
  hasSubChecklist?: boolean;
  loadingSubChecklist?: boolean;
  onOpenSubChecklist?: () => void;
}

export function QuestionHeader({
  question,
  index,
  numberLabel,
  showComments,
  onToggleComments,
  hasSubChecklist = false,
  loadingSubChecklist = false,
  onOpenSubChecklist
}: QuestionHeaderProps) {
  const isRequired = question?.isRequired;
  
  return (
    <div className="flex items-start gap-2">
      <div className="flex-1">
        <p className="font-medium text-sm flex items-start gap-1.5">
          <span className="text-gray-600 min-w-[24px] pt-0.5">
            {numberLabel || `${index + 1})`}
          </span>
          <span>{question.text}</span>
          
          {isRequired && (
            <span className="text-red-500">*</span>
          )}
        </p>
        
        <div className="flex items-center mt-1 ml-8 space-x-2">
          <button
            type="button"
            onClick={onToggleComments}
            className={`text-xs flex items-center ${showComments ? 'text-primary font-medium' : 'text-gray-500'}`}
          >
            <MessageSquare className="h-3.5 w-3.5 mr-1" />
            {showComments ? "Ocultar comentário" : "Adicionar comentário"}
          </button>
        </div>
        
        {hasSubChecklist && onOpenSubChecklist && (
          <SubChecklistButton
            hasSubChecklist={hasSubChecklist}
            loading={loadingSubChecklist}
            onOpenSubChecklist={onOpenSubChecklist}
          />
        )}
      </div>
    </div>
  );
}
