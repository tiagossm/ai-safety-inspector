
import React from "react";
import { Button } from "@/components/ui/button";
import { Camera, Video, File, Mic, Loader2 } from "lucide-react";

interface MediaCaptureButtonsProps {
  allowsPhoto?: boolean;
  allowsVideo?: boolean;
  allowsAudio?: boolean;
  allowsFiles?: boolean;
  disabled?: boolean;
  isUploading?: boolean;
  isRecording?: boolean;
  onAddMedia: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPhotoCapture?: () => void;
  onVideoCapture?: () => void;
}

export function MediaCaptureButtons({
  allowsPhoto = false,
  allowsVideo = false,
  allowsAudio = false,
  allowsFiles = false,
  disabled = false,
  isUploading = false,
  isRecording = false,
  onAddMedia,
  onStartRecording,
  onStopRecording,
  onPhotoCapture,
  onVideoCapture
}: MediaCaptureButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {allowsPhoto && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onPhotoCapture || onAddMedia}
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
          onClick={onVideoCapture || onAddMedia}
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
          onClick={isRecording ? onStopRecording : onStartRecording}
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
          onClick={onAddMedia}
          disabled={disabled || isUploading}
          className="flex items-center"
        >
          <File className="h-4 w-4 mr-2" />
          <span>Arquivo</span>
        </Button>
      )}
    </div>
  );
}
