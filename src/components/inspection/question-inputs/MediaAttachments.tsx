
import React, { useState } from "react";
import { X, PlayCircle, PauseCircle, ZoomIn, Download, Sparkles } from "lucide-react";
import { MediaPreviewDialog } from "@/components/media/MediaPreviewDialog";
import { MediaAnalysisDialog } from "@/components/media/MediaAnalysisDialog";
import { MediaAttachmentRenderer } from "@/components/media/renderers/MediaAttachmentRenderer";
import { MediaAnalysisResult } from "@/hooks/useMediaAnalysis";
import { Button } from "@/components/ui/button";

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
  const [isPlaying, setIsPlaying] = useState(false);

  const handleOpenPreview = (url: string) => {
    setActivePreviewUrl(url);
  };

  const handleOpenAnalysis = (url: string) => {
    setActiveAnalysisUrl(url);
  };

  const toggleAudioPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };
  
  const handleAnalysisComplete = (result: MediaAnalysisResult) => {
    if (onSaveAnalysis && activeAnalysisUrl) {
      onSaveAnalysis(activeAnalysisUrl, result);
    }
  };

  const handleApplySuggestion = (url: string) => {
    const analysis = analysisResults[url];
    if (onApplyAISuggestion && analysis?.actionPlanSuggestion) {
      onApplyAISuggestion(analysis.actionPlanSuggestion);
    }
  };
  
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {mediaUrls.map((url, index) => (
          <div key={index} className="relative">
            <MediaAttachmentRenderer
              key={index}
              url={url}
              index={index}
              onOpenPreview={handleOpenPreview}
              onOpenAnalysis={handleOpenAnalysis}
              onDelete={onDelete}
              readOnly={readOnly}
              questionText={questionText}
              analysisResults={analysisResults}
            />
            
            {analysisResults[url]?.actionPlanSuggestion && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm font-medium text-amber-700 mb-1">Sugestão da IA:</p>
                <p className="text-xs text-amber-900 mb-2">{analysisResults[url].actionPlanSuggestion}</p>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="w-full bg-amber-100 hover:bg-amber-200 border-amber-300"
                  onClick={() => handleApplySuggestion(url)}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Aplicar sugestão ao plano de ação
                </Button>
              </div>
            )}
          </div>
        ))}
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
        questionText={questionText}
        onAnalysisComplete={handleAnalysisComplete}
      />
    </>
  );
}
