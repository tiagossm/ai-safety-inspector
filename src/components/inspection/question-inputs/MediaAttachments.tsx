
import React, { useState } from "react";
import { X, PlayCircle, PauseCircle, ZoomIn, Download, Sparkles, AlertTriangle } from "lucide-react";
import { MediaPreviewDialog } from "@/components/media/MediaPreviewDialog";
import { MediaAnalysisDialog } from "@/components/media/MediaAnalysisDialog";
import { MediaAttachmentRenderer } from "@/components/media/renderers/MediaAttachmentRenderer";
import { MediaAnalysisResult } from "@/hooks/useMediaAnalysis";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MediaRenderer } from "@/components/media/MediaRenderer";

interface MediaAttachmentsProps {
  mediaUrls: string[];
  onDelete?: (url: string) => void;
  onOpenPreview: (url: string) => void;
  onOpenAnalysis: (url: string, questionContext?: string) => void;
  readOnly?: boolean;
  questionText?: string;
  onSaveAnalysis?: (url: string, result: MediaAnalysisResult) => void;
  onApplyAISuggestion?: (suggestion: string) => void;
  analysisResults?: Record<string, MediaAnalysisResult>;
}

export function MediaAttachments({ 
  mediaUrls, 
  onDelete, 
  onOpenPreview,
  onOpenAnalysis,
  readOnly = false, 
  questionText,
  onSaveAnalysis,
  onApplyAISuggestion,
  analysisResults = {}
}: MediaAttachmentsProps) {
  const [activePreviewUrl, setActivePreviewUrl] = useState<string | null>(null);
  const [activeAnalysisUrl, setActiveAnalysisUrl] = useState<string | null>(null);
  const [activeMediaType, setActiveMediaType] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!Array.isArray(mediaUrls) || mediaUrls.length === 0) {
    return null;
  }

  console.log("MediaAttachments rendering with URLs:", mediaUrls);

  const handleOpenPreview = (url: string) => {
    console.log("MediaAttachments: Opening preview for URL:", url);
    setActivePreviewUrl(url);
    onOpenPreview(url);
  };

  const handleOpenAnalysis = (url: string, questionText?: string) => {
    console.log("MediaAttachments: Opening analysis for URL:", url);
    console.log("MediaAttachments: Question context:", questionText);
    setActiveAnalysisUrl(url);
    setActiveMediaType(null);
    onOpenAnalysis(url, questionText);
  };

  const toggleAudioPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };
  
  const handleAnalysisComplete = (result: MediaAnalysisResult) => {
    console.log("MediaAttachments: Analysis complete:", result);
    console.log("MediaAttachments: Active analysis URL:", activeAnalysisUrl);
    console.log("MediaAttachments: Question context:", questionText);
    
    if (onSaveAnalysis && activeAnalysisUrl) {
      // Make sure the question text is included in the result
      const resultWithContext = {
        ...result,
        questionText: questionText || result.questionText
      };
      onSaveAnalysis(activeAnalysisUrl, resultWithContext);
    }
  };

  const handleApplySuggestion = (url: string) => {
    const analysis = analysisResults[url];
    console.log("MediaAttachments: Applying suggestion for URL:", url);
    console.log("MediaAttachments: Analysis result:", analysis);
    console.log("MediaAttachments: Question context:", analysis?.questionText || questionText);
    
    if (onApplyAISuggestion && analysis?.actionPlanSuggestion) {
      console.log("MediaAttachments: Applying suggestion:", analysis.actionPlanSuggestion);
      onApplyAISuggestion(analysis.actionPlanSuggestion);
    }
  };

  const hasAnyAnalysis = () => {
    return Object.keys(analysisResults).length > 0;
  };

  const hasNonConformity = () => {
    return Object.values(analysisResults).some(result => result.hasNonConformity);
  };

  const handleDeleteMedia = (url: string) => {
    if (onDelete) {
      console.log("MediaAttachments: Deleting media URL:", url);
      onDelete(url);
    }
  };
  
  return (
    <>
      {hasAnyAnalysis() && hasNonConformity() && (
        <div className="mb-3">
          <Badge className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1 mb-2" variant="outline">
            <AlertTriangle className="h-3 w-3 mr-1" />
            <span>Análise de IA detectou possível não conformidade</span>
          </Badge>
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
        {mediaUrls.map((url, index) => {
          const analysis = analysisResults?.[url];
          const hasAnalysis = !!analysis;
          const hasActionSuggestion = hasAnalysis && !!analysis.actionPlanSuggestion;
          
          return (
            <div key={index} className="relative flex flex-col h-auto">
              <div className="relative flex-grow border rounded-md overflow-hidden" style={{maxHeight: "160px", minHeight: "100px"}}>
                <MediaRenderer 
                  url={url} 
                  className="w-full h-full object-contain" 
                />
                
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleDeleteMedia(url)}
                    className="absolute top-1 right-1 bg-white/80 hover:bg-red-100 rounded-full p-1 transition-colors"
                    aria-label="Remover mídia"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </button>
                )}
                
                <div className="absolute bottom-1 right-1 flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenPreview(url)}
                    className="bg-white/80 hover:bg-blue-100 rounded-full p-1 transition-colors"
                    aria-label="Visualizar mídia"
                  >
                    <ZoomIn className="h-4 w-4 text-blue-500" />
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleOpenAnalysis(url, questionText)}
                    className="bg-white/80 hover:bg-purple-100 rounded-full p-1 transition-colors"
                    aria-label="Analisar mídia"
                  >
                    <Sparkles className="h-4 w-4 text-purple-500" />
                  </button>
                </div>
                
                {hasAnalysis && analysis.hasNonConformity && (
                  <div className="absolute top-1 left-1 z-10">
                    <Badge className="bg-amber-500 text-white">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      <span className="text-xs">Não conformidade</span>
                    </Badge>
                  </div>
                )}
              </div>
              
              {hasActionSuggestion && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-xs font-medium text-amber-700 mb-1">Sugestão da IA:</p>
                  <p className="text-xs text-amber-900 mb-2 line-clamp-2">
                    {analysis.actionPlanSuggestion}
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full bg-amber-100 hover:bg-amber-200 border-amber-300 text-xs py-1 px-2 h-auto"
                    onClick={() => handleApplySuggestion(url)}
                    type="button"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    Aplicar sugestão
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <MediaPreviewDialog 
        open={!!activePreviewUrl}
        onOpenChange={() => setActivePreviewUrl(null)}
        url={activePreviewUrl}
      />
      
      <MediaAnalysisDialog 
        open={!!activeAnalysisUrl}
        onOpenChange={() => setActiveAnalysisUrl(null)}
        mediaUrl={activeAnalysisUrl}
        mediaType={activeMediaType}
        questionText={questionText}
        onAnalysisComplete={handleAnalysisComplete}
      />
    </>
  );
}
