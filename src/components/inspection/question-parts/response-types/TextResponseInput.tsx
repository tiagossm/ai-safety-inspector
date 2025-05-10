
import React, { useState, useEffect } from "react";
import { MediaUploadInput } from "../../question-inputs/MediaUploadInput";
import { MediaAnalysisResult } from "@/hooks/useMediaAnalysis";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface TextResponseInputProps {
  question: any;
  response: any;
  onResponseChange: (value: any) => void;
  onMediaChange: (mediaUrls: string[]) => void;
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
    response?.mediaAnalysis || {}
  );
  
  // Update local state when response changes
  useEffect(() => {
    if (response?.mediaAnalysis) {
      setAnalysisResults(response.mediaAnalysis);
    }
  }, [response?.mediaAnalysis]);
  
  const handleSaveAnalysis = (url: string, result: MediaAnalysisResult) => {
    const newResults = {
      ...analysisResults,
      [url]: result
    };
    
    setAnalysisResults(newResults);
    
    // Update the response with the new analysis results
    const updatedResponse = {
      ...response,
      mediaAnalysis: newResults
    };
    
    onResponseChange(updatedResponse);
    
    // If there's a non-conformity, show a toast notification
    if (result.hasNonConformity) {
      toast.info("IA detectou possível não conformidade", {
        description: "Foi sugerido um plano de ação.",
        duration: 5000
      });
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
      
      {/* Media upload section if allowed */}
      {(question.allowsPhoto || question.permite_foto || 
        question.allowsVideo || question.permite_video ||
        question.allowsAudio || question.permite_audio ||
        question.allowsFiles || question.permite_files) && (
        <MediaUploadInput 
          mediaUrls={response?.mediaUrls || []}
          onMediaChange={onMediaChange}
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
