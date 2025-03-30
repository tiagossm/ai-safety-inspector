
import React from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface QuestionHeaderProps {
  question: any;
  index: number;
  isFollowUpQuestion: boolean;
  response: any;
  showCommentSection: boolean;
  setShowCommentSection: (show: boolean) => void;
  numberLabel?: string;
}

export function QuestionHeader({
  question,
  index,
  isFollowUpQuestion,
  response,
  showCommentSection,
  setShowCommentSection,
  numberLabel = ""
}: QuestionHeaderProps) {
  const hasComment = response?.notes && response.notes.trim().length > 0;
  
  return (
    <div className="flex justify-between gap-2">
      <div className="flex-1">
        <div className="flex items-start">
          <span className="font-medium text-sm mr-2">{numberLabel}</span>
          <span className="text-sm">
            {question.text}
            {question.isRequired && <span className="text-red-500 ml-1">*</span>}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        {hasComment && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setShowCommentSection(!showCommentSection)}
                >
                  <MessageSquare className="h-4 w-4 text-primary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Esta questão possui comentários</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {question.weight > 1 && (
          <Badge variant="secondary" className="text-xs">
            Peso {question.weight}
          </Badge>
        )}
      </div>
    </div>
  );
}
