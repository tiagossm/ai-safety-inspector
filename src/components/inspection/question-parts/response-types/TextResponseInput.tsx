
import React, { useState, useEffect } from "react";
import { MediaUploadInput } from "../../question-inputs/MediaUploadInput";
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
}

export const TextResponseInput: React.FC<TextResponseInputProps> = ({
  question,
  response,
  onResponseChange,
  onMediaChange,
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
      console.log("TextResponseInput updating analysis results:", response.mediaAnalysisResults);
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
  
  const handleSaveAnalysis = (url: string, result: MediaAnalysisResult) => {
    console.log("TextResponseInput saving analysis for URL:", url, result);
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
  };
  
  // Check if we have non-conformity results in any media analysis
  const hasNonConformityInAnalysis = Object.values(analysisResults).some(result => 
    result.hasNonConformity
  );
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (readOnly) return;
    onResponseChange({ 
      ...response, 
      value: e.target.value 
    });
  };

  const handleMediaChange = (urls: string[]) => {
    if (onMediaChange) {
      console.log("TextResponseInput media URLs changed:", urls);
      onMediaChange(urls);
      
      // Also update the response directly
      onResponseChange({
        ...response,
        mediaUrls: urls
      });
    }
  };
  
  const handleApplyAISuggestion = () => {
    if (aiSuggestion && onApplyAISuggestion) {
      console.log("Applying AI suggestion:", aiSuggestion);
      onApplyAISuggestion(aiSuggestion);
      toast.success("Sugestão da IA aplicada", {
        description: "O plano de ação foi preenchido com a sugestão da IA",
      });
    }
  };

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
            variant="outline" 
            className="w-full bg-amber-100 hover:bg-amber-200 border-amber-300"
            onClick={handleApplyAISuggestion}
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Aplicar esta sugestão
          </Button>
        </div>
      )}
      
      {/* Media upload section if allowed */}
      {(question.allowsPhoto || question.permite_foto || 
        question.allowsVideo || question.permite_video ||
        question.allowsAudio || question.permite_audio ||
        question.allowsFiles || question.permite_files) && (
        <MediaUploadInput 
          mediaUrls={response?.mediaUrls || []}
          onMediaChange={handleMediaChange}
          allowsPhoto={question.allowsPhoto || question.permite_foto}
          allowsVideo={question.allowsVideo || question.permite_video}
          allowsAudio={question.allowsAudio || question.permite_audio}
          allowsFiles={question.allowsFiles || question.permite_files}
          readOnly={readOnly}
          questionText={question.text || question.pergunta || ""}
          onSaveAnalysis={handleSaveAnalysis}
          analysisResults={analysisResults}
          onApplyAISuggestion={onApplyAISuggestion}
        />
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
              let summary = '';
              
              if (result.type === 'image' || result.type === 'video') {
                summary = result.analysis && result.analysis.length > 100 
                  ? result.analysis.substring(0, 100) + '...' 
                  : result.analysis || '';
              } else if (result.type === 'audio') {
                summary = result.transcription && result.transcription.length > 100 
                  ? result.transcription.substring(0, 100) + '...' 
                  : result.transcription || '';
              }
              
              return (
                <div key={index} className="text-xs border-l-2 border-blue-300 pl-3 py-1">
                  <div className="font-medium mb-1">
                    {result.type === 'image' && 'Análise de Imagem'}
                    {result.type === 'video' && 'Análise de Vídeo'}
                    {result.type === 'audio' && 'Transcrição de Áudio'}
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
