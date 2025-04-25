
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Video, Mic, File } from "lucide-react";
import { MediaAttachments } from "./MediaAttachments";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { toast } from "sonner";

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
  allowsPhoto = false,
  allowsVideo = false,
  allowsAudio = false,
  allowsFiles = false
}: MediaUploadInputProps) {
  const { uploadFile, uploadMedia, isUploading, progress } = useMediaUpload();
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    try {
      const file = files[0];
      const result = await uploadFile(file);
      
      if (result?.url) {
        onMediaChange([...mediaUrls, result.url]);
        toast.success("Arquivo enviado com sucesso!");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Erro ao enviar arquivo.");
    }
  };
  
  const handleMediaCapture = async (type: 'photo' | 'video' | 'audio') => {
    toast.info(`Captura de ${type === 'photo' ? 'foto' : type === 'video' ? 'vídeo' : 'áudio'} será implementada em breve.`);
    
    // Simulate a media upload for demonstration
    const mockUrl = `https://placehold.co/300x200?text=${type}+${Date.now()}`;
    onMediaChange([...mediaUrls, mockUrl]);
  };
  
  const handleDeleteMedia = (urlToDelete: string) => {
    const updatedUrls = mediaUrls.filter(url => url !== urlToDelete);
    onMediaChange(updatedUrls);
    toast.success("Anexo removido.");
  };
  
  return (
    <div className="space-y-4">
      {/* Media Buttons */}
      <div className="flex flex-wrap gap-2">
        {allowsPhoto && (
          <Button 
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleMediaCapture('photo')}
            disabled={isUploading}
            className="flex items-center"
          >
            <Camera className="h-4 w-4 mr-2" />
            <span>Foto</span>
          </Button>
        )}
        
        {allowsVideo && (
          <Button 
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleMediaCapture('video')}
            disabled={isUploading}
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
            onClick={() => handleMediaCapture('audio')}
            disabled={isUploading}
            className="flex items-center"
          >
            <Mic className="h-4 w-4 mr-2" />
            <span>Áudio</span>
          </Button>
        )}
        
        {allowsFiles && (
          <div>
            <input
              type="file"
              id="file-upload"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
            <label htmlFor="file-upload">
              <Button 
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploading}
                className="flex items-center cursor-pointer"
                asChild
              >
                <span>
                  <File className="h-4 w-4 mr-2" />
                  <span>Arquivo</span>
                </span>
              </Button>
            </label>
          </div>
        )}
      </div>
      
      {/* Progress bar when uploading */}
      {isUploading && (
        <div className="w-full">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-center mt-1">Enviando... {progress}%</p>
        </div>
      )}
      
      {/* Display uploaded media */}
      {mediaUrls.length > 0 && (
        <MediaAttachments 
          mediaUrls={mediaUrls} 
          onDelete={handleDeleteMedia}
        />
      )}
    </div>
  );
}
