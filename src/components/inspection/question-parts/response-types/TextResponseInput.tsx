import React, { useState, useEffect, useCallback } from "react";
import { MediaUploadInput } from "../../question-inputs/MediaUploadInput";
import { MediaAnalysisResult } from "@/hooks/useMediaAnalysis";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MediaAttachments } from "@/components/inspection/question-inputs/MediaAttachments";

interface TextResponseInputProps {
  question: any;
  response: any;
  onResponseChange: (value: any) => void;
  onMediaChange?: (mediaUrls: string[]) => void;
  onApplyAISuggestion?: (suggestion: string) => void;
  readOnly?: boolean;
  inspectionId?: string;
  actionPlan?: any;
  onSaveActionPlan?: (data: any) => Promise<void>;
}

export const TextResponseInput: React.FC<TextResponseInputProps> = ({
  question,
  response,
  onResponseChange,
  onMediaChange,
  onApplyAISuggestion,
  readOnly = false,
  inspectionId,
  actionPlan,
  onSaveActionPlan
}) => {
  const [analysisResults, setAnalysisResults] = useState<Record<string, MediaAnalysisResult>>(
    response?.mediaAnalysisResults || {}
  );
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  
  // Update local state when response changes
  useEffect(() => {
    if (response?.mediaAnalysisResults) {
      console.log("TextResponseInput: updating analysis results:", response.mediaAnalysisResults);
      setAnalysisResults(response.mediaAnalysisResults);
    }
  }, [response?.mediaAnalysisResults]);
  
  // Find the first AI suggestion from all media analysis results
  useEffect(() => {
    const suggestion = Object.values(analysisResults).find(result => 
      result?.actionPlanSuggestion
    )?.actionPlanSuggestion || null;
    
    setAiSuggestion(suggestion);
  }, [analysisResults]);
  
  const handleSaveAnalysis = useCallback((url: string, result: MediaAnalysisResult) => {
    console.log("TextResponseInput: saving analysis for URL:", url, result);
    const newResults = {
      ...analysisResults,
      [url]: result
    };
    
    setAnalysisResults(newResults);
    
    // Update the response with the new analysis results
    const updatedResponse = {
      ...response,
      mediaAnalysisResults: newResults
    };
    
    onResponseChange(updatedResponse);
    
    // If there's a non-conformity, show a toast notification
    if (result.hasNonConformity) {
      toast.info("IA detectou possível não conformidade", {
        description: "Foi sugerido um plano de ação.",
        duration: 5000
      });
    }
    
    // If we have an action plan suggestion, update state
    if (result.actionPlanSuggestion) {
      setAiSuggestion(result.actionPlanSuggestion);
    }
  }, [analysisResults, response, onResponseChange]);
  
  // Check if we have non-conformity results in any media analysis
  const hasNonConformityInAnalysis = Object.values(analysisResults).some(result => 
    result.hasNonConformity
  );
  
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (readOnly) return;
    onResponseChange({ 
      ...response, 
      value: e.target.value 
    });
  }, [readOnly, response, onResponseChange]);

  const handleMediaChange = useCallback((urls: string[]) => {
    console.log("TextResponseInput: media URLs changed:", urls);
    
    const updatedResponse = {
      ...response,
      mediaUrls: urls
    };
    
    onResponseChange(updatedResponse);
    
    if (onMediaChange) {
      onMediaChange(urls);
    }
  }, [response, onResponseChange, onMediaChange]);
  
  const handleApplyAISuggestion = useCallback(() => {
    if (aiSuggestion && onApplyAISuggestion) {
      console.log("TextResponseInput: Applying AI suggestion:", aiSuggestion);
      onApplyAISuggestion(aiSuggestion);
      toast.success("Sugestão da IA aplicada", {
        description: "O plano de ação foi preenchido com a sugestão da IA",
      });
    }
  }, [aiSuggestion, onApplyAISuggestion]);

  // Funções para lidar com a mídia
  const handleOpenPreview = useCallback((url: string) => {
    console.log("TextResponseInput: Opening preview for URL:", url);
  }, []);

  const handleOpenAnalysis = useCallback((url: string) => {
    console.log("TextResponseInput: Opening analysis for URL:", url);
  }, []);

  const handleDeleteMedia = useCallback((urlToDelete: string) => {
    console.log("TextResponseInput: Deleting media URL:", urlToDelete);
    const currentMediaUrls = response?.mediaUrls || [];
    const updatedMediaUrls = currentMediaUrls.filter(url => url !== urlToDelete);
    handleMediaChange(updatedMediaUrls);
  }, [response, handleMediaChange]);

  // Verificar se existem mídias anexadas
  const mediaUrls = response?.mediaUrls || [];
  const hasMedia = mediaUrls.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-2">
        <textarea
          className="w-full border rounded p-2 text-sm"
          rows={3}
          placeholder="Digite sua resposta..."
          value={response?.value || ''}
          onChange={handleTextChange}
          disabled={readOnly}
        />
        
        {/* Show AI analysis indicator if we have non-conformity in media analysis */}
        {hasNonConformityInAnalysis && (
          <Badge className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1" variant="outline">
            <AlertCircle className="h-3 w-3" />
            <span>IA detectou não conformidade</span>
          </Badge>
        )}
      </div>

      {/* Renderização inline das mídias anexadas (imediatamente após o textarea) */}
      {hasMedia && (
        <MediaAttachments
          mediaUrls={mediaUrls}
          onDelete={!readOnly ? handleDeleteMedia : undefined}
          onOpenPreview={handleOpenPreview}
          onOpenAnalysis={handleOpenAnalysis}
          readOnly={readOnly}
          questionText={question.text || question.pergunta || ""}
          analysisResults={analysisResults}
          onSaveAnalysis={handleSaveAnalysis}
          onApplyAISuggestion={onApplyAISuggestion}
        />
      )}
      
      {/* AI Suggestion for Action Plan */}
      {aiSuggestion && (
        <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <div className="flex items-center mb-2">
            <Sparkles className="h-4 w-4 mr-1 text-amber-500" />
            <span className="text-sm font-medium text-amber-700">Sugestão da IA</span>
          </div>
          <p className="text-sm mb-3 text-amber-800">{aiSuggestion}</p>
          <Button 
            size="sm" 
            type="button"
            variant="outline" 
            className="w-full bg-amber-100 hover:bg-amber-200 border-amber-300"
            onClick={handleApplyAISuggestion}
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Aplicar esta sugestão
          </Button>
        </div>
      )}
      
      {/* Display analysis results that are relevant to the question */}
      {Object.keys(analysisResults).length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
          <h4 className="text-sm font-medium mb-2 flex items-center">
            <span>Análises de IA</span>
          </h4>
          <div className="space-y-3">
            {Object.entries(analysisResults).map(([url, result], index) => {
              // Only show a summary of the analysis here
              let summary = result.analysis || '';
              
              if (summary && summary.length > 100) {
                summary = summary.substring(0, 100) + '...';
              }
              
              const mediaType = result.type || 'document';
              
              return (
                <div key={index} className="text-xs border-l-2 border-blue-300 pl-3 py-1">
                  <div className="font-medium mb-1">
                    {mediaType === 'image' && 'Análise de Imagem'}
                    {mediaType === 'video' && 'Análise de Vídeo'}
                    {mediaType === 'audio' && 'Transcrição de Áudio'}
                    {mediaType === 'document' && 'Análise de Documento'}
                  </div>
                  <p className="text-gray-600">{summary}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
