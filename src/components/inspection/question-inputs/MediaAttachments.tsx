
import React, { useState } from "react";
import { X, PlayCircle, PauseCircle, ZoomIn, Download, Sparkles, AlertTriangle } from "lucide-react";
import { MediaPreviewDialog } from "@/components/media/MediaPreviewDialog";
import { MediaAnalysisDialog } from "@/components/media/MediaAnalysisDialog";
import { MediaAttachmentRenderer } from "@/components/media/renderers/MediaAttachmentRenderer";
import { MediaAnalysisResult } from "@/hooks/useMediaAnalysis";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MediaAttachmentsProps {
  mediaUrls: string[];
  onDelete?: (url: string) => void;
  readOnly?: boolean;
  questionText?: string;
  onSaveAnalysis?: (url: string, result: MediaAnalysisResult) => void;
  onApplyAISuggestion?: (suggestion: string) => void;
  analysisResults?: Record<string, MediaAnalysisResult>;
}

export function MediaAttachments({ 
  mediaUrls, 
  onDelete, 
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

  const handleOpenPreview = (url: string) => {
    console.log("MediaAttachments: Opening preview for URL:", url);
    setActivePreviewUrl(url);
  };

  const handleOpenAnalysis = (url: string, type?: string) => {
    console.log("MediaAttachments: Opening analysis for URL:", url);
    console.log("MediaAttachments: Media type:", type);
    setActiveAnalysisUrl(url);
    setActiveMediaType(type || null);
  };

  const toggleAudioPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };
  
  const handleAnalysisComplete = (result: MediaAnalysisResult) => {
    console.log("MediaAttachments: Analysis complete:", result);
    console.log("MediaAttachments: Active analysis URL:", activeAnalysisUrl);
    if (onSaveAnalysis && activeAnalysisUrl) {
      onSaveAnalysis(activeAnalysisUrl, result);
    }
  };

  const handleApplySuggestion = (url: string) => {
    const analysis = analysisResults[url];
    console.log("MediaAttachments: Applying suggestion for URL:", url);
    console.log("MediaAttachments: Analysis result:", analysis);
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
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {mediaUrls.map((url, index) => {
          const analysis = analysisResults?.[url];
          const hasAnalysis = !!analysis;
          const hasActionSuggestion = hasAnalysis && !!analysis.actionPlanSuggestion;
          
          return (
            <div key={index} className="relative flex flex-col h-auto">
              <div className="relative flex-grow border rounded-md overflow-hidden" style={{maxHeight: "160px", minHeight: "100px"}}>
                <MediaAttachmentRenderer
                  url={url}
                  index={index}
                  onOpenPreview={handleOpenPreview}
                  onOpenAnalysis={(url) => handleOpenAnalysis(url)}
                  onDelete={onDelete}
                  readOnly={readOnly}
                  questionText={questionText}
                  analysisResults={analysisResults}
                  smallSize={true}
                />
                
                {hasAnalysis && analysis.hasNonConformity && (
                  <div className="absolute top-1 right-1 z-10">
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
