
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, MessageSquare } from "lucide-react";
import { EnhancedMediaUpload } from "./EnhancedMediaUpload";
import { ResponseActions } from "./ResponseActions";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface EnhancedQuestionItemProps {
  question: any;
  response: any;
  index: number;
  onResponseChange: (data: any) => void;
  onMediaChange?: (mediaUrls: string[]) => void;
  onMediaUpload?: (file: File) => Promise<string | null>;
  isEditable: boolean;
}

export function EnhancedQuestionItem({
  question,
  response,
  index,
  onResponseChange,
  onMediaChange,
  onMediaUpload,
  isEditable
}: EnhancedQuestionItemProps) {
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isActionPlanOpen, setIsActionPlanOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Determine if it's a yes/no question
  const isYesNoQuestion = 
    question.responseType === 'yes_no' || 
    question.tipo_resposta === 'yes_no' ||
    question.tipo_resposta === 'sim_nao';
  
  // Handle response change
  const handleResponseChange = (value: any) => {
    onResponseChange({
      ...response,
      value
    });
    
    // If the response is "no" or "não", automatically open action plan
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
  
  // Handle media upload
  const handleMediaChange = (urls: string[]) => {
    if (onMediaChange) {
      onMediaChange(urls);
    } else {
      onResponseChange({
        ...response,
        mediaUrls: urls
      });
    }
  };
  
  // Function to analyze the media with AI
  const handleAnalyzeMedia = async () => {
    const mediaUrls = response.mediaUrls || [];
    if (!mediaUrls.length) {
      toast.error("Nenhuma mídia anexada para análise");
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      // This would be an API call to analyze the media
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock the AI response
      const aiAnalysis = "Análise de IA: A imagem mostra equipamentos em condições inadequadas de armazenamento. Recomendo revisar os protocolos de segurança.";
      
      // Update the response with the AI analysis
      onResponseChange({
        ...response,
        comment: aiAnalysis,
        actionPlan: response.value === "não" ? "Implementar medidas corretivas para adequação ao protocolo de segurança." : response.actionPlan
      });
      
      // Open the comment section to show the analysis
      setIsCommentOpen(true);
      if (response.value === "não" || response.value === "no" || response.value === false) {
        setIsActionPlanOpen(true);
      }
      
      toast.success("Análise de mídia concluída com sucesso!");
    } catch (error) {
      console.error("Error analyzing media:", error);
      toast.error("Erro ao analisar mídia. Tente novamente.");
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Check if the response is negative
  const hasNegativeResponse = 
    response.value === "não" || 
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
      <div className="space-y-2">
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
        
        {/* Enhanced media upload component */}
        <EnhancedMediaUpload
          mediaUrls={response.mediaUrls || []}
          onMediaChange={handleMediaChange}
          onMediaUpload={onMediaUpload}
          allowsPhoto={question.allowsPhoto || question.permite_foto}
          allowsVideo={question.allowsVideo || question.permite_video}
          allowsAudio={question.allowsAudio || question.permite_audio}
          allowsFiles={true}
          disabled={!isEditable}
        />
        
        {/* AI analysis button if there are media files */}
        {isEditable && (response.mediaUrls?.length > 0) && (
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={handleAnalyzeMedia}
            disabled={isAnalyzing}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isAnalyzing ? "Analisando..." : "Analisar com IA"}
          </Button>
        )}
      </div>
      
      {/* Response actions (comment and action plan) */}
      <ResponseActions
        isCommentOpen={isCommentOpen}
        setIsCommentOpen={setIsCommentOpen}
        isActionPlanOpen={isActionPlanOpen}
        setIsActionPlanOpen={setIsActionPlanOpen}
        hasNegativeResponse={hasNegativeResponse}
      />
      
      {/* Comment section */}
      {isCommentOpen && (
        <div className="pt-2 border-t border-dashed">
          <p className="text-sm font-medium text-gray-700 mb-1 flex items-center">
            <MessageSquare className="h-4 w-4 mr-1" /> Comentário:
          </p>
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
          <p className="text-sm font-medium text-red-700 mb-1 flex items-center">
            <MessageSquare className="h-4 w-4 mr-1" /> Plano de Ação:
          </p>
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
    </div>
  );
}
