
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Video, File, Mic, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { MediaPreview } from "./MediaPreview";
import { MediaPreviewDialog } from "./MediaPreviewDialog";
import { AIAnalysisButton } from "./AIAnalysisButton";
import { useAudioRecording } from "@/hooks/useAudioRecording";

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
      toast.error("Tipo de arquivo não permitido");
      return;
    }

    try {
      setIsUploading(true);
      const url = await onMediaUpload(file);
      if (url) {
        toast.success("Mídia adicionada com sucesso");
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error: any) {
      toast.error(`Erro ao adicionar mídia: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveMedia = (urlToRemove: string) => {
    const updatedUrls = mediaUrls.filter(url => url !== urlToRemove);
    onMediaChange(updatedUrls);
    toast.success("Mídia removida com sucesso");
  };

  const handleAddMedia = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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

      <div className="flex flex-wrap gap-2">
        {allowsPhoto && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddMedia}
            disabled={disabled || isUploading}
            className="flex items-center"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Camera className="h-4 w-4 mr-2" />
            )}
            <span>Foto</span>
          </Button>
        )}
        
        {allowsVideo && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddMedia}
            disabled={disabled || isUploading}
            className="flex items-center"
          >
            <Video className="h-4 w-4 mr-2" />
            <span>Vídeo</span>
          </Button>
        )}
        
        {allowsAudio && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled || isUploading}
            className={`flex items-center ${isRecording ? 'bg-red-100 border-red-500' : ''}`}
          >
            <Mic className={`h-4 w-4 mr-2 ${isRecording ? 'text-red-500' : ''}`} />
            <span>{isRecording ? 'Parar Gravação' : 'Gravar Áudio'}</span>
          </Button>
        )}
        
        {allowsFiles && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddMedia}
            disabled={disabled || isUploading}
            className="flex items-center"
          >
            <File className="h-4 w-4 mr-2" />
            <span>Arquivo</span>
          </Button>
        )}

        {mediaUrls.length > 0 && onAIAnalysis && (
          <AIAnalysisButton 
            questionId={questionId}
            mediaUrls={mediaUrls}
            questionText={questionText}
            onAnalysisComplete={onAIAnalysis}
            disabled={disabled || mediaUrls.length === 0}
          />
        )}
      </div>

      {mediaUrls.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {mediaUrls.map((url, index) => (
            <MediaPreview 
              key={`${url}-${index}`}
              url={url}
              onPreview={setPreviewUrl}
              onRemove={handleRemoveMedia}
            />
          ))}
        </div>
      )}

      <MediaPreviewDialog 
        previewUrl={previewUrl}
        onOpenChange={(open) => !open && setPreviewUrl(null)}
      />
    </div>
  );
}
