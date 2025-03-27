
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CornerDownRight, Info, MessageCircle, XCircle } from "lucide-react";

interface QuestionHeaderProps {
  question: any;
  index: number;
  isFollowUpQuestion: boolean;
  response: any;
  showCommentSection: boolean;
  setShowCommentSection: (show: boolean) => void;
}

export function QuestionHeader({
  question,
  index,
  isFollowUpQuestion,
  response,
  showCommentSection,
  setShowCommentSection
}: QuestionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-2">
        {isFollowUpQuestion && (
          <CornerDownRight className="h-3.5 w-3.5 mt-1 text-gray-400" />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="font-medium text-sm text-gray-600">{index + 1}.</span>
            <h3 className="font-medium text-sm text-gray-800">{question.text}</h3>
            {question.isRequired && (
              <Badge variant="outline" className="text-red-500 text-xs h-4 ml-1">*</Badge>
            )}
          </div>
          
          {response?.comment && !showCommentSection && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCommentSection(true)}
              className="mt-1.5 flex items-center gap-1 text-xs h-7 text-gray-500"
            >
              <MessageCircle className="h-3 w-3" />
              <span>Mostrar Comentário</span>
            </Button>
          )}
          
          {(showCommentSection || response?.comment) && (
            <div className="mt-1.5 bg-slate-50 p-2 rounded-md">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-slate-600">Comentário:</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCommentSection(false)}
                  className="h-5 w-5 p-0"
                >
                  <XCircle className="h-3 w-3 text-gray-400" />
                </Button>
              </div>
              <p className="text-xs leading-relaxed text-slate-600">{response?.comment || "Nenhum comentário adicionado ainda."}</p>
            </div>
          )}
        </div>
      </div>
      
      {question.hint && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 mt-0"
          title="Dica da pergunta"
        >
          <Info className="h-3.5 w-3.5 text-gray-400" />
        </Button>
      )}
    </div>
  );
}
