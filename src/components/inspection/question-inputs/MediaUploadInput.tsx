
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { MediaDialog } from "../dialogs/MediaDialog";
import { MediaPreviewDialog } from "@/components/media/MediaPreviewDialog";
import { MediaAnalysisDialog } from "@/components/media/MediaAnalysisDialog";
import { getFileType } from "@/utils/fileUtils";
import { MediaAttachments } from "./MediaAttachments";
import { MediaAnalysisResult } from "@/hooks/useMediaAnalysis";

interface MediaUploadInputProps {
  mediaUrls: string[];
  onMediaChange: (mediaUrls: string[]) => void;
  allowsPhoto?: boolean;
  allowsVideo?: boolean;
  allowsAudio?: boolean;
  allowsFiles?: boolean;
  readOnly?: boolean;
  questionText?: string;
  onSaveAnalysis?: (url: string, result: MediaAnalysisResult) => void;
  analysisResults?: Record<string, MediaAnalysisResult>;
}

export function MediaUploadInput({
  mediaUrls = [],
  onMediaChange,
  allowsPhoto = true,
  allowsVideo = false,
  allowsAudio = false,
  allowsFiles = false,
  readOnly = false,
  questionText,
  onSaveAnalysis,
  analysisResults = {}
}: MediaUploadInputProps) {
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<string | null>(null);

  const handleAddMedia = useCallback(() => {
    if (!readOnly) setMediaDialogOpen(true);
  }, [readOnly]);

  const handleMediaUploaded = useCallback((urls: string[]) => {
    if (urls.length > 0) onMediaChange([...mediaUrls, ...urls]);
  }, [mediaUrls, onMediaChange]);

  const handleDeleteMedia = useCallback((urlToDelete: string) => {
    if (!readOnly) {
      onMediaChange(mediaUrls.filter(url => url !== urlToDelete));
    }
  }, [readOnly, mediaUrls, onMediaChange]);

  const handlePreviewMedia = useCallback((url: string) => {
    setSelectedMedia(url);
    setPreviewDialogOpen(true);
  }, []);

  const handleAnalyzeMedia = useCallback((url: string) => {
    setSelectedMedia(url);
    setSelectedMediaType(getMediaType(url));
    setAnalysisDialogOpen(true);
  }, []);

  const handleAnalysisComplete = useCallback((result: MediaAnalysisResult) => {
    if (onSaveAnalysis && selectedMedia) {
      onSaveAnalysis(selectedMedia, result);
    }
  }, [onSaveAnalysis, selectedMedia]);

  function getMediaType(url: string): string {
    const fileType = getFileType(url);
    switch (fileType) {
      case 'image': return 'image/jpeg';
      case 'video': return 'video/mp4';
      case 'audio': return 'audio/mp3';
      default: return 'application/octet-stream';
    }
  }

  const allowedTypes = [];
  if (allowsPhoto) allowedTypes.push('image/*');
  if (allowsVideo) allowedTypes.push('video/*');
  if (allowsAudio) allowedTypes.push('audio/*');
  if (allowsFiles) allowedTypes.push('application/pdf', '.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar');

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {!readOnly && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleAddMedia}
            className="text-xs flex items-center gap-1"
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Adicionar mídia</span>
          </Button>
        )}
        {mediaUrls.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {mediaUrls.length} {mediaUrls.length === 1 ? 'arquivo' : 'arquivos'}
          </span>
        )}
      </div>

      <MediaDialog
        open={mediaDialogOpen}
        onOpenChange={setMediaDialogOpen}
        onMediaUploaded={handleMediaUploaded}
        response={{ mediaUrls }}
        allowedTypes={allowedTypes}
      />
      
      <MediaPreviewDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        url={selectedMedia}
      />
      
      <MediaAnalysisDialog
        open={analysisDialogOpen}
        onOpenChange={setAnalysisDialogOpen}
        mediaUrl={selectedMedia}
        mediaType={selectedMediaType}
        questionText={questionText}
        onAnalysisComplete={handleAnalysisComplete}
        multimodalAnalysis={true}
        additionalMediaUrls={mediaUrls.filter(url => url !== selectedMedia)}
      />
      
      <MediaAttachments
        mediaUrls={mediaUrls}
        onDelete={readOnly ? undefined : handleDeleteMedia}
        onOpenPreview={handlePreviewMedia}
        onOpenAnalysis={handleAnalyzeMedia}
        readOnly={readOnly}
        questionText={questionText}
        onSaveAnalysis={onSaveAnalysis}
        analysisResults={analysisResults}
      />
    </div>
  );
}
