
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QuestionHeaderProps {
  question: any;
  index: number;
  isFollowUpQuestion: boolean;
  response: any;
  showCommentSection: boolean;
  setShowCommentSection: (show: boolean) => void;
  numberLabel?: string; // Add number label for hierarchical display
}

export function QuestionHeader({
  question,
  index,
  isFollowUpQuestion,
  response,
  showCommentSection,
  setShowCommentSection,
  numberLabel
}: QuestionHeaderProps) {
  // Determine if the question has been answered
  const isAnswered = response && response.value !== undefined;
  
  // Use the provided number label or fall back to the index + 1
  const displayNumber = numberLabel || `${index + 1})`;
  
  return (
    <div className="flex items-start justify-between mb-1">
      <div className="flex items-start gap-2">
        <span className="font-medium mt-0.5">{displayNumber}</span>
        <div>
          <h3 className={`font-medium text-base ${isFollowUpQuestion ? 'mt-0.5' : ''}`}>
            {question.text}
          </h3>
          
          {question.subHeader && (
            <p className="text-sm text-muted-foreground -mt-0.5">
              {question.subHeader}
            </p>
          )}
        </div>
        
        {question.isRequired && (
          <Badge variant="outline" className="text-red-500 ml-1">*</Badge>
        )}
        
        {isAnswered && response.comment && (
          <Badge 
            variant="outline" 
            className="ml-1 cursor-pointer"
            onClick={() => setShowCommentSection(!showCommentSection)}
          >
            Comentário
          </Badge>
        )}
      </div>
      
      {question.hint && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{question.hint}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
