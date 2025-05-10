
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MediaUploadInput } from "../../question-inputs/MediaUploadInput";
import { Check, X, Minus } from "lucide-react";
import { MediaAnalysisResult } from "@/hooks/useMediaAnalysis";

interface YesNoResponseInputProps {
  question: any;
  response: any;
  inspectionId?: string;
  onResponseChange: (value: any) => void;
  onMediaChange?: (mediaUrls: string[]) => void;
  actionPlan?: any;
  onSaveActionPlan?: (data: any) => Promise<void>;
  readOnly?: boolean;
}

export const YesNoResponseInput: React.FC<YesNoResponseInputProps> = ({
  question,
  response,
  inspectionId,
  onResponseChange,
  onMediaChange,
  actionPlan,
  onSaveActionPlan,
  readOnly = false
}) => {
  const [analysisResults, setAnalysisResults] = useState<Record<string, MediaAnalysisResult>>(
    response?.mediaAnalysis || {}
  );

  const handleValueChange = (value: string) => {
    if (readOnly) return;
    onResponseChange({ ...response, value });
  };

  const handleMediaChange = (urls: string[]) => {
    if (onMediaChange) {
      onMediaChange(urls);
    }
  };
  
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
  };

  const renderButtons = () => {
    const isPositive = response?.value === 'yes' || response?.value === 'sim';
    const isNegative = response?.value === 'no' || response?.value === 'não';
    const isNeutral = response?.value === 'na' || response?.value === 'n/a';

    return (
      <div className="flex gap-2">
        {/* Yes Button */}
        <Button
          variant={isPositive ? "default" : "outline"}
          className={`flex items-center gap-2 ${isPositive ? "bg-green-500 hover:bg-green-600" : ""}`}
          onClick={() => handleValueChange('sim')}
          disabled={readOnly}
          size="sm"
        >
          <Check className="h-4 w-4" />
          <span>SIM</span>
        </Button>

        {/* No Button */}
        <Button
          variant={isNegative ? "default" : "outline"}
          className={`flex items-center gap-2 ${isNegative ? "bg-red-500 hover:bg-red-600" : ""}`}
          onClick={() => handleValueChange('não')}
          disabled={readOnly}
          size="sm"
        >
          <X className="h-4 w-4" />
          <span>NÃO</span>
        </Button>

        {/* N/A Button */}
        <Button
          variant={isNeutral ? "default" : "outline"}
          className={`flex items-center gap-2 ${isNeutral ? "bg-gray-500 hover:bg-gray-600" : ""}`}
          onClick={() => handleValueChange('n/a')}
          disabled={readOnly}
          size="sm"
        >
          <Minus className="h-4 w-4" />
          <span>N/A</span>
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderButtons()}

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
