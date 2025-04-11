
import React from "react";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

interface QuestionHeaderProps {
  question: any;
  index: number;
  numberLabel?: string;
  isFollowUpQuestion: boolean;
  response: any;
  showCommentSection: boolean;
  setShowCommentSection: (show: boolean) => void;
}

export function QuestionHeader({
  question,
  index,
  numberLabel,
  isFollowUpQuestion,
  response,
  showCommentSection,
  setShowCommentSection
}: QuestionHeaderProps) {
  const isAnswered = !!response?.value;
  const hasComment = !!response?.comment;
  
  return (
    <div className="flex items-start gap-2 mb-2">
      <div className="flex-1">
        <p className="font-medium text-sm flex items-start gap-1.5">
          <span className="text-gray-600 min-w-[24px] pt-0.5">
            {numberLabel || `${index + 1})`}
          </span>
          <span>{question.text}</span>
          
          {question.isRequired && (
            <span className="text-red-500">*</span>
          )}
        </p>
        
        {hasComment && (
          <div 
            className={`mt-1 ml-8 text-xs text-gray-600 cursor-pointer ${showCommentSection ? 'font-medium text-primary' : ''}`}
            onClick={() => setShowCommentSection(!showCommentSection)}
          >
            {showCommentSection ? "Ocultar comentário" : "Ver comentário"}
          </div>
        )}
        
        {showCommentSection && hasComment && (
          <div className="mt-1 ml-8 p-2 bg-gray-50 rounded text-xs text-gray-700 border border-gray-200">
            {response.comment}
          </div>
        )}
      </div>
      
      {question.isRequired && !isAnswered && (
        <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
          <AlertCircle className="h-3.5 w-3.5 mr-1" />
          Pendente
        </Badge>
      )}
    </div>
  );
}
