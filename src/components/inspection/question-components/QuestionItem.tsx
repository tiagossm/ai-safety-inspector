
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { MediaList } from "../enhanced/MediaList";
import { MediaUploadButton } from "../enhanced/MediaUploadButton";
import { MediaPreviewDialog } from "../enhanced/MediaPreviewDialog";

interface QuestionItemProps {
  question: any;
  response: any;
  index: number;
  onResponseChange: (data: any) => void;
  onMediaUpload: (file: File) => Promise<string | null>;
  isEditable: boolean;
}

export function QuestionItem({
  question,
  response,
  index,
  onResponseChange,
  onMediaUpload,
  isEditable
}: QuestionItemProps) {
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isActionPlanOpen, setIsActionPlanOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Determine if it's a yes/no question
  const isYesNoQuestion = question.responseType === 'yes_no' || 
                          question.tipo_resposta === 'yes_no' ||
                          question.tipo_resposta === 'sim_nao';
  
  // Handle response change
  const handleResponseChange = (value: any) => {
    onResponseChange({
      ...response,
      value
    });
    
    // If response is negative, automatically show the action plan
    if (value === "não" || value === "no" || value === false) {
      setIsActionPlanOpen(true);
    }
  };
  
  // Handle comment change
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onResponseChange({
      ...response,
      comment: e.target.value
    });
  };
  
  // Handle action plan change
  const handleActionPlanChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onResponseChange({
      ...response,
      actionPlan: e.target.value
    });
  };
  
  // Handle media operations
  const handleMediaUpload = async (file: File) => {
    const url = await onMediaUpload(file);
    if (url) {
      const currentMediaUrls = response.mediaUrls || [];
      onResponseChange({
        ...response,
        mediaUrls: [...currentMediaUrls, url]
      });
    }
    return url;
  };
  
  const handleMediaPreview = (url: string) => {
    setPreviewUrl(url);
  };
  
  const handleMediaRemove = (urlToRemove: string) => {
    const currentMediaUrls = response.mediaUrls || [];
    onResponseChange({
      ...response,
      mediaUrls: currentMediaUrls.filter(url => url !== urlToRemove)
    });
  };
  
  const handleAIAnalysis = (comment: string, actionPlan?: string) => {
    onResponseChange({
      ...response,
      comment,
      actionPlan: actionPlan || response.actionPlan
    });
    
    // Open comment section after AI analysis
    setIsCommentOpen(true);
    if (actionPlan) {
      setIsActionPlanOpen(true);
    }
  };
  
  // Check if the response is negative
  const hasNegativeResponse = response.value === "não" || 
                            response.value === "no" || 
                            response.value === false;
  
  return (
    <div className="space-y-4">
      {/* Question header with required badge if applicable */}
      <div className="flex items-start justify-between">
        <h3 className="font-medium text-base flex-1">
          <span className="mr-2">{index + 1}.</span>
          {question.text || question.pergunta}
        </h3>
        
        {(question.isRequired || question.obrigatorio) && (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Obrigatório
          </Badge>
        )}
      </div>
      
      {/* Response inputs based on question type */}
      {isYesNoQuestion ? (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={response.value === "sim" || response.value === "yes" || response.value === true ? "default" : "outline"}
            className={response.value === "sim" || response.value === "yes" || response.value === true ? "bg-green-600 hover:bg-green-700" : ""}
            onClick={() => handleResponseChange("sim")}
            disabled={!isEditable}
          >
            Sim
          </Button>
          <Button
            size="sm"
            variant={response.value === "não" || response.value === "no" || response.value === false ? "default" : "outline"}
            className={response.value === "não" || response.value === "no" || response.value === false ? "bg-red-600 hover:bg-red-700" : ""}
            onClick={() => handleResponseChange("não")}
            disabled={!isEditable}
          >
            Não
          </Button>
          <Button
            size="sm"
            variant={response.value === "n/a" ? "default" : "outline"}
            className={response.value === "n/a" ? "bg-gray-600 hover:bg-gray-700" : ""}
            onClick={() => handleResponseChange("n/a")}
            disabled={!isEditable}
          >
            N/A
          </Button>
        </div>
      ) : (
        <Textarea
          placeholder="Digite sua resposta aqui..."
          value={response.value || ""}
          onChange={(e) => handleResponseChange(e.target.value)}
          disabled={!isEditable}
          className="resize-none"
          rows={3}
        />
      )}
      
      {/* Media list and upload button */}
      <div className="space-y-2">
        <MediaList
          mediaUrls={response.mediaUrls || []}
          questionId={question.id}
          questionText={question.text || question.pergunta}
          onPreview={handleMediaPreview}
          onRemove={handleMediaRemove}
          onAIAnalysis={handleAIAnalysis}
          previewSize="md"
        />
        
        {isEditable && (
          <MediaUploadButton
            onMediaUpload={handleMediaUpload}
            disabled={!isEditable}
          />
        )}
      </div>
      
      {/* Comments and action plan togglers */}
      <div className="flex flex-wrap gap-2 border-t pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCommentOpen(!isCommentOpen)}
          className="flex items-center"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          <span>Comentário</span>
          {isCommentOpen ? (
            <ChevronUp className="h-4 w-4 ml-2" />
          ) : (
            <ChevronDown className="h-4 w-4 ml-2" />
          )}
        </Button>
        
        {hasNegativeResponse && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsActionPlanOpen(!isActionPlanOpen)}
            className="flex items-center text-red-600"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            <span>Plano de Ação</span>
            {isActionPlanOpen ? (
              <ChevronUp className="h-4 w-4 ml-2" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-2" />
            )}
          </Button>
        )}
      </div>
      
      {/* Comment section */}
      {isCommentOpen && (
        <div className="pt-2 border-t border-dashed">
          <p className="text-sm font-medium text-gray-700 mb-1">Comentário:</p>
          <Textarea
            placeholder="Adicione um comentário..."
            value={response.comment || ""}
            onChange={handleCommentChange}
            disabled={!isEditable}
            className="resize-none text-sm"
            rows={2}
          />
        </div>
      )}
      
      {/* Action plan section for negative responses */}
      {isActionPlanOpen && hasNegativeResponse && (
        <div className="pt-2 border-t border-dashed">
          <p className="text-sm font-medium text-red-700 mb-1">Plano de Ação:</p>
          <Textarea
            placeholder="Descreva as ações corretivas necessárias..."
            value={response.actionPlan || ""}
            onChange={handleActionPlanChange}
            disabled={!isEditable}
            className="resize-none text-sm border-red-200 bg-red-50"
            rows={2}
          />
        </div>
      )}
      
      {/* Media preview dialog */}
      <MediaPreviewDialog 
        previewUrl={previewUrl} 
        onOpenChange={(open) => {
          if (!open) setPreviewUrl(null);
        }}
        mediaUrls={response.mediaUrls || []}
      />
    </div>
  );
}
