
import React, { useEffect, useState } from "react";
import { X, ZoomIn, Download, Sparkles, AlertTriangle, Heart } from "lucide-react";
import { MediaPreviewDialog } from "@/components/media/MediaPreviewDialog";
import { MediaAnalysisDialog } from "@/components/media/MediaAnalysisDialog";
import { MediaAttachmentRenderer } from "@/components/media/renderers/MediaAttachmentRenderer";
import { MediaAnalysisResult } from "@/hooks/useMediaAnalysis";
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

  // Corrigido para evitar erro se result estiver undefined
  const hasNonConformity = () => {
    return Object.values(analysisResults).some(result => result && result.hasNonConformity);
  };

  const hasPsychosocialRisk = () => {
    return Object.values(analysisResults).some(result => result && result.psychosocialRiskDetected);
  };

  const getSuggestionFromAnalysis = (url: string): string | undefined => {
    const analysis = analysisResults[url];
    if (!analysis) return undefined;
    
    // First try to get the dedicated actionPlanSuggestion field
    if (analysis.actionPlanSuggestion) {
      return analysis.actionPlanSuggestion;
    }
    
    // If there's no specific suggestion but there's non-conformity, extract from analysis
    if (analysis.hasNonConformity) {
      // Try to extract action plan from any analysis text available
      if (analysis.analysis) {
        return extractActionPlanSuggestion(analysis.analysis);
      }
      if (analysis.imageAnalysis) {
        return extractActionPlanSuggestion(analysis.imageAnalysis);
      }
      if (analysis.videoAnalysis) {
        return extractActionPlanSuggestion(analysis.videoAnalysis);
      }
    }
    
    return undefined;
  };
  
  // Helper function to extract action plan suggestions from text
  const extractActionPlanSuggestion = (text: string): string | undefined => {
    const actionPlanPatterns = [
      /Plano de ação sugerido:([^]*?)(?=\n\n|\n$|$)/i,
      /Sugestão de ação:([^]*?)(?=\n\n|\n$|$)/i,
      /Recomendação:([^]*?)(?=\n\n|\n$|$)/i,
      /Ação recomendada:([^]*?)(?=\n\n|\n$|$)/i
    ];
    
    for (const pattern of actionPlanPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return undefined;
  };

  const handleDeleteMedia = (url: string) => {
    if (onDelete) {
      console.log("MediaAttachments: Deleting media URL:", url);
      onDelete(url);
    }
  };
  
  return (
    <>
      {hasAnyAnalysis() && (
        <div className="mb-3 flex flex-wrap gap-2">
          {hasNonConformity() && (
            <Badge className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1 mb-2" variant="outline">
              <AlertTriangle className="h-3 w-3 mr-1" />
              <span>Análise de IA detectou possível não conformidade</span>
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
      />
    </>
  );
}
