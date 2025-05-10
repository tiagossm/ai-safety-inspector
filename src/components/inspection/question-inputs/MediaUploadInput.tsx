
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Pencil, Trash2, Search, Play, FileText, Mic, FileVideo, Image, Sparkles } from "lucide-react";
import { MediaDialog } from "../dialogs/MediaDialog";
import { MediaPreviewDialog } from "@/components/media/MediaPreviewDialog";
import { MediaAnalysisDialog } from "@/components/media/MediaAnalysisDialog";
import { getFileType, getFilenameFromUrl } from "@/utils/fileUtils";
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
  onApplyAISuggestion?: (suggestion: string) => void;
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
  onApplyAISuggestion,
  analysisResults = {}
}: MediaUploadInputProps) {
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<string | null>(null);
  
  const handleAddMedia = () => {
    if (!readOnly) {
      console.log("MediaUploadInput: Opening media dialog");
      setMediaDialogOpen(true);
    }
  };
  
  const handleMediaUploaded = (urls: string[]) => {
    console.log("MediaUploadInput: Media uploaded:", urls);
    const newUrls = [...mediaUrls, ...urls];
    onMediaChange(newUrls);
  };
  
  const handleDeleteMedia = (urlToDelete: string) => {
    if (!readOnly) {
      console.log("MediaUploadInput: Deleting media:", urlToDelete);
      const filteredUrls = mediaUrls.filter(url => url !== urlToDelete);
      onMediaChange(filteredUrls);
    }
  };
  
  const handlePreviewMedia = (url: string) => {
    setSelectedMedia(url);
    setPreviewDialogOpen(true);
  };
  
  const handleAnalyzeMedia = (url: string, type: string) => {
    console.log("MediaUploadInput: Analyzing media:", url, type);
    setSelectedMedia(url);
    setSelectedMediaType(type);
    setAnalysisDialogOpen(true);
  };
  
  const handleAnalysisComplete = (result: MediaAnalysisResult) => {
    console.log("MediaUploadInput: Analysis complete:", result);
    if (onSaveAnalysis && selectedMedia) {
      onSaveAnalysis(selectedMedia, result);
    }
  };

  const getMediaType = (url: string): string => {
    const fileType = getFileType(url);
    switch(fileType) {
      case 'image': return 'image/jpeg';
      case 'video': return 'video/mp4';
      case 'audio': return 'audio/mp3';
      default: return 'application/octet-stream';
    }
  };

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
      
      {mediaUrls.length > 0 && (
        <MediaAttachments 
          mediaUrls={mediaUrls} 
          onDelete={!readOnly ? handleDeleteMedia : undefined} 
          readOnly={readOnly}
          questionText={questionText}
          onSaveAnalysis={onSaveAnalysis}
          onApplyAISuggestion={onApplyAISuggestion}
          analysisResults={analysisResults}
        />
      )}
      
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
      />
    </div>
  );
}
