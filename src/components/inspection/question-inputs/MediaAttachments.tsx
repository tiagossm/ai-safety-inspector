
import React, { useState } from "react";
import { X, ZoomIn, Download, Sparkles, Heart } from "lucide-react";
import { MediaPreviewDialog } from "@/components/media/MediaPreviewDialog";
import { MediaAnalysisDialog } from "@/components/media/MediaAnalysisDialog";
import { MediaAttachmentRenderer } from "@/components/media/renderers/MediaAttachmentRenderer";
import { MediaAnalysisResult, Plan5W2H } from "@/hooks/useMediaAnalysis";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MediaAttachmentsProps {
  mediaUrls: string[];
  onDelete?: (url: string) => void;
  onOpenPreview: (url: string) => void;
  onOpenAnalysis: (url: string, questionContext?: string) => void;
  readOnly?: boolean;
  questionText?: string;
  onSaveAnalysis?: (url: string, result: MediaAnalysisResult) => void;
  onApplyAISuggestion?: (plan: Plan5W2H) => void; // Alterado para Plan5W2H
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

  // Checa se existe ao menos um resultado com plano de ação sugerido
  const hasAnyActionSuggestion = () =>
    Object.values(analysisResults).some(result => result?.actionPlanSuggestion);

  // Checa se existe risco psicossocial detectado em alguma análise
  const hasPsychosocialRisk = () =>
    Object.values(analysisResults).some(result => result?.psychosocialRiskDetected);

  const handleOpenPreview = (url: string) => {
    setActivePreviewUrl(url);
    onOpenPreview(url);
  };

  const handleOpenAnalysis = (url: string, questionText?: string) => {
    setActiveAnalysisUrl(url);
    setActiveMediaType(null);
    onOpenAnalysis(url, questionText);
  };

  const toggleAudioPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };
  
  const handleAnalysisComplete = (url: string, result: MediaAnalysisResult) => {
    if (onSaveAnalysis && activeAnalysisUrl) {
      const resultWithContext = {
        ...result,
        questionText: questionText || ''
      };
      onSaveAnalysis(activeAnalysisUrl, resultWithContext);
    }
  };

  const handleApplySuggestion = (url: string) => {
    const analysis = analysisResults[url];
    if (onApplyAISuggestion && analysis?.plan5w2h) {
      onApplyAISuggestion(analysis.plan5w2h);
    }
  };

  const handleDeleteMedia = (url: string) => {
    if (onDelete) {
      onDelete(url);
    }
  };
  
  return (
    <>
      {(Object.keys(analysisResults).length > 0) && (
        <div className="mb-3 flex flex-wrap gap-2">
          {hasAnyActionSuggestion() && (
            <Badge className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1 mb-2" variant="outline">
              <Sparkles className="h-3 w-3 mr-1" />
              <span>Plano de ação sugerido pela IA em uma ou mais mídias</span>
            </Badge>
          )}
          
          {hasPsychosocialRisk() && (
            <Badge className="bg-rose-100 text-rose-800 border-rose-300 flex items-center gap-1 mb-2" variant="outline">
              <Heart className="h-3 w-3 mr-1" />
              <span>Risco psicossocial detectado</span>
            </Badge>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <MediaAttachmentRenderer
          urls={mediaUrls}
          onOpenPreview={handleOpenPreview}
          onOpenAnalysis={handleOpenAnalysis}
          readOnly={readOnly}
          onDelete={onDelete ? handleDeleteMedia : undefined}
          questionText={questionText}
          analysisResults={analysisResults}
          smallSize={true}
        />
      </div>
      <MediaPreviewDialog
        open={!!activePreviewUrl}
        onOpenChange={open => {
          if (!open) setActivePreviewUrl(null);
        }}
        url={activePreviewUrl}
      />
      <MediaAnalysisDialog
        open={!!activeAnalysisUrl}
        onOpenChange={open => {
          if (!open) setActiveAnalysisUrl(null);
        }}
        mediaUrl={activeAnalysisUrl}
        mediaType={activeMediaType}
        questionText={questionText}
        onAnalysisComplete={handleAnalysisComplete}
        additionalMediaUrls={mediaUrls}
        onAdd5W2HActionPlan={onApplyAISuggestion}
      />
    </>
  );
}
