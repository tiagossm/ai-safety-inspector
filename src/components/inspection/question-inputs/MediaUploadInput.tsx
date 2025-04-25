
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Camera, Video, Mic, File, Upload, X, Loader2 } from "lucide-react";
import { MediaAttachments } from "./MediaAttachments";
import { useMediaUpload } from "@/hooks/useMediaUpload";

interface MediaUploadInputProps {
  mediaUrls: string[];
  onMediaChange: (urls: string[]) => void;
  allowsPhoto?: boolean;
  allowsVideo?: boolean;
  allowsAudio?: boolean;
  allowsFiles?: boolean;
}

export function MediaUploadInput({
  mediaUrls = [],
  onMediaChange,
  allowsPhoto = true,
  allowsVideo = false, 
  allowsAudio = false,
  allowsFiles = false
}: MediaUploadInputProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, progress } = useMediaUpload();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      
      // Check file type against allowed types
      const isImage = file.type.startsWith('image/');
      const isVideoFile = file.type.startsWith('video/');
      const isAudioFile = file.type.startsWith('audio/');
      
      if (isImage && !allowsPhoto) {
        toast.error("Este item não permite upload de imagens");
        return;
      }
      
      if (isVideoFile && !allowsVideo) {
        toast.error("Este item não permite upload de vídeos");
        return;
      }
      
      if (isAudioFile && !allowsAudio) {
        toast.error("Este item não permite upload de áudios");
        return;
      }
      
      if (!isImage && !isVideoFile && !isAudioFile && !allowsFiles) {
        toast.error("Este item não permite upload deste tipo de arquivo");
        return;
      }
      
      const result = await uploadFile(file);
      
      if (result && result.url) {
        // Append to existing media URLs
        const updatedMediaUrls = [...mediaUrls, result.url];
        onMediaChange(updatedMediaUrls);
        toast.success(`${file.name} enviado com sucesso`);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(`Erro ao enviar arquivo: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  
  const handleRemoveMedia = (urlToRemove: string) => {
    const updatedMediaUrls = mediaUrls.filter(url => url !== urlToRemove);
    onMediaChange(updatedMediaUrls);
    toast.success("Mídia removida");
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="space-y-3 mt-2">
      <div className="flex flex-wrap gap-2">
        {allowsPhoto && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-xs flex items-center gap-1"
            onClick={triggerFileInput}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
            <span>Foto</span>
          </Button>
        )}
        
        {allowsVideo && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-xs flex items-center gap-1"
            onClick={triggerFileInput}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Video className="h-3.5 w-3.5" />}
            <span>Vídeo</span>
          </Button>
        )}
        
        {allowsAudio && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-xs flex items-center gap-1"
            onClick={triggerFileInput}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mic className="h-3.5 w-3.5" />}
            <span>Áudio</span>
          </Button>
        )}
        
        {allowsFiles && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-xs flex items-center gap-1"
            onClick={triggerFileInput}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <File className="h-3.5 w-3.5" />}
            <span>Arquivo</span>
          </Button>
        )}
      </div>
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept={`${allowsPhoto ? 'image/*,' : ''}${allowsVideo ? 'video/*,' : ''}${allowsAudio ? 'audio/*,' : ''}${allowsFiles ? '*' : ''}`}
      />
      
      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
          <div 
            className="bg-primary h-1.5 rounded-full transition-all duration-300 ease-in-out" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      <MediaAttachments 
        mediaUrls={mediaUrls} 
        onDelete={handleRemoveMedia}
      />
    </div>
  );
}
