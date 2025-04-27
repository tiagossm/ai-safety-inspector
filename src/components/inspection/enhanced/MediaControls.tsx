
import React, { useRef, useState } from "react";
import { MediaCaptureButtons } from "./MediaCaptureButtons";
import { MediaList } from "./MediaList";
import { MediaPreviewDialog } from "./MediaPreviewDialog";
import { useAudioRecording } from "@/hooks/useAudioRecording";
import { toast } from "@/components/ui/use-toast";

interface MediaControlsProps {
  allowsPhoto?: boolean;
  allowsVideo?: boolean;
  allowsAudio?: boolean;
  allowsFiles?: boolean;
  mediaUrls: string[];
  questionId: string;
  questionText: string;
  disabled?: boolean;
  onMediaUpload: (file: File) => Promise<string | null>;
  onMediaChange: (urls: string[]) => void;
  onAIAnalysis?: (comment: string, actionPlan?: string) => void;
}

export function MediaControls({
  allowsPhoto = false,
  allowsVideo = false,
  allowsAudio = false,
  allowsFiles = false,
  mediaUrls = [],
  questionId,
  questionText,
  disabled = false,
  onMediaUpload,
  onMediaChange,
  onAIAnalysis
}: MediaControlsProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isRecording, startRecording, stopRecording } = useAudioRecording(onMediaUpload);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type.split('/')[0];
    const isValidFile = 
      (allowsPhoto && fileType === 'image') || 
      (allowsVideo && fileType === 'video') || 
      (allowsAudio && fileType === 'audio') || 
      (allowsFiles && !['image', 'video', 'audio'].includes(fileType));

    if (!isValidFile) {
      toast({
        title: "Tipo de arquivo não permitido",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);
      const url = await onMediaUpload(file);
      if (url) {
        toast({
          title: "Mídia adicionada com sucesso",
          variant: "default"
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error: any) {
      toast({
        title: `Erro ao adicionar mídia: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddMedia = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveMedia = (urlToRemove: string) => {
    const updatedUrls = mediaUrls.filter(url => url !== urlToRemove);
    onMediaChange(updatedUrls);
    toast({
      title: "Mídia removida com sucesso",
      variant: "default"
    });
  };

  if (!allowsPhoto && !allowsVideo && !allowsAudio && !allowsFiles) {
    return null;
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept={[
          allowsPhoto && 'image/*',
          allowsVideo && 'video/*',
          allowsAudio && 'audio/*',
          allowsFiles && '*/*'
        ].filter(Boolean).join(',')}
      />

      <MediaCaptureButtons 
        allowsPhoto={allowsPhoto}
        allowsVideo={allowsVideo}
        allowsAudio={allowsAudio}
        allowsFiles={allowsFiles}
        disabled={disabled}
        isUploading={isUploading}
        isRecording={isRecording}
        onAddMedia={handleAddMedia}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
      />

      <MediaList 
        mediaUrls={mediaUrls}
        questionId={questionId}
        questionText={questionText}
        onPreview={setPreviewUrl}
        onRemove={handleRemoveMedia}
        onAIAnalysis={onAIAnalysis}
      />

      <MediaPreviewDialog 
        previewUrl={previewUrl}
        onOpenChange={(open) => !open && setPreviewUrl(null)}
      />
    </div>
  );
}
