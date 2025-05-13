
import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowRightSquare, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface QuestionHeaderProps {
  question: any;
  index: number;
  numberLabel?: string;
  showComments?: boolean;
  onToggleComments?: () => void;
  hasSubChecklist?: boolean;
  loadingSubChecklist?: boolean;
  onOpenSubChecklist?: () => void;
}

export function QuestionHeader({ 
  question, 
  index, 
  numberLabel = "", 
  showComments = false,
  onToggleComments = () => {},
  hasSubChecklist = false,
  loadingSubChecklist = false,
  onOpenSubChecklist = () => {}
}: QuestionHeaderProps) {
  // Determina se estamos lidando com uma pergunta de risco psicossocial
  const isPsychosocialRisk = question?.tags?.includes('psychosocial') || question?.psychosocialRisk;
  
  return (
    <div className="flex flex-col space-y-1">
      <div className="flex justify-between">
        <div className="flex items-start space-x-2 flex-1">
          {numberLabel && (
            <span className="inline-flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs font-medium flex-shrink-0">
              {numberLabel}
            </span>
          )}
          
          <h3 className="text-base font-medium">
            {question.text || question.pergunta || "Pergunta sem texto"}
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={onToggleComments}
          >
            <MessageCircle className={`h-4 w-4 ${showComments ? 'text-blue-500' : 'text-gray-400'}`} />
            <span className="sr-only">Comentários</span>
          </Button>
          
          {hasSubChecklist && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 flex items-center"
              onClick={onOpenSubChecklist}
              disabled={loadingSubChecklist}
            >
              {loadingSubChecklist ? (
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              ) : (
                <ArrowRightSquare className="h-4 w-4 text-blue-500" />
              )}
              <span className="sr-only">Sub-checklist</span>
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {isPsychosocialRisk && (
          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-300">
            Risco Psicossocial
          </Badge>
        )}
        
        {question.tags && question.tags.map((tag: string) => (
          <Badge key={tag} variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-300">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}
