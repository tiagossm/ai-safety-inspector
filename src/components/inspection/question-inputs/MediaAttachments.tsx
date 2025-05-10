
import React, { useState } from "react";
import { X, PlayCircle, PauseCircle, ZoomIn, Download, Sparkles } from "lucide-react";
import { MediaPreviewDialog } from "@/components/media/MediaPreviewDialog";
import { MediaAnalysisDialog } from "@/components/media/MediaAnalysisDialog";
import { MediaAttachmentRenderer } from "@/components/media/renderers/MediaAttachmentRenderer";
import { MediaAnalysisResult } from "@/hooks/useMediaAnalysis";

interface MediaAttachmentsProps {
  mediaUrls: string[];
  onDelete?: (url: string) => void;
  readOnly?: boolean;
  questionText?: string;
  onSaveAnalysis?: (url: string, result: MediaAnalysisResult) => void;
  analysisResults?: Record<string, MediaAnalysisResult>;
}

export function MediaAttachments({ 
  mediaUrls, 
  onDelete, 
  readOnly = false, 
  questionText,
  onSaveAnalysis,
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
  
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {mediaUrls.map((url, index) => (
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
