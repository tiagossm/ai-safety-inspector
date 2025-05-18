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
  const [planoAcao, setPlanoAcao] = useState<string[]>([]);

  const handleAddMedia = useCallback(() => {
    if (!readOnly) {
      setMediaDialogOpen(true);
    }
  }, [readOnly]);

  const handleMediaUploaded = useCallback((urls: string[]) => {
    if (urls.length > 0) {
      const newUrls = [...mediaUrls, ...urls];
      onMediaChange(newUrls);
    }
  }, [mediaUrls, onMediaChange]);

  const handleDeleteMedia = useCallback((urlToDelete: string) => {
    if (!readOnly) {
      const filteredUrls = mediaUrls.filter(url => url !== urlToDelete);
      onMediaChange(filteredUrls);
    }
  }, [readOnly, mediaUrls, onMediaChange]);

  const handlePreviewMedia = useCallback((url: string) => {
    setSelectedMedia(url);
    setPreviewDialogOpen(true);
  }, []);

  const handleAnalyzeMedia = useCallback((url: string, questionContext?: string) => {
    setSelectedMedia(url);
    const mediaType = getMediaType(url);
    setSelectedMediaType(mediaType);
    setAnalysisDialogOpen(true);
  }, [questionText]);

  const handleAnalysisComplete = useCallback((result: MediaAnalysisResult) => {
    if (onSaveAnalysis && selectedMedia) {
      const resultWithContext = {
        ...result,
        questionText: questionText || ''
      };
      onSaveAnalysis(selectedMedia, resultWithContext);
    }
  }, [onSaveAnalysis, selectedMedia, questionText]);

  // NOVO: Handler do plano de ação
  const handleAddActionPlan = useCallback((suggestion: string) => {
    setPlanoAcao(prev => [...prev, suggestion]);
    setAnalysisDialogOpen(false);
  }, []);

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

      {/* Aqui passa o handler de adicionar ao plano de ação */}
      <MediaAnalysisDialog
        open={analysisDialogOpen}
        onOpenChange={setAnalysisDialogOpen}
        mediaUrl={selectedMedia}
        mediaType={selectedMediaType}
        questionText={questionText}
        onAnalysisComplete={handleAnalysisComplete}
        onAddActionPlan={handleAddActionPlan}
      />

      {/* Visualização do plano de ação */}
      {planoAcao.length > 0 && (
        <ul className="mt-2">
          {planoAcao.map((acao, idx) => (
            <li key={idx} className="text-xs text-green-800">{acao}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
