
import React, { useState, useEffect, useCallback } from "react";
import { MediaAnalysisResult } from "@/hooks/useMediaAnalysis";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
  onApplyAISuggestion,
  readOnly = false
}) => {
  const [analysisResults, setAnalysisResults] = useState<Record<string, MediaAnalysisResult>>(
    response?.mediaAnalysisResults || {}
  );
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  
  // Update local state when response changes
  useEffect(() => {
    if (response?.mediaAnalysisResults) {
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
  
  const handleApplyAISuggestion = useCallback(() => {
    if (aiSuggestion && onApplyAISuggestion) {
      onApplyAISuggestion(aiSuggestion);
      toast.success("Sugestão da IA aplicada", {
        description: "O plano de ação foi preenchido com a sugestão da IA",
      });
    }
  }, [aiSuggestion, onApplyAISuggestion]);

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
