
import React, { memo } from "react";
import { MediaCaptureMenu } from "./MediaCaptureMenu";
import { Button } from "@/components/ui/button";
import { Camera, Video, Mic } from "lucide-react";

interface PhotoInputProps {
  onAddMedia: () => void;
  mediaUrls: string[] | undefined;
  allowsPhoto?: boolean;
  allowsVideo?: boolean;
  allowsAudio?: boolean;
}

export const PhotoInput = memo(function PhotoInput({ 
  onAddMedia, 
  mediaUrls,
  allowsPhoto = true,
  allowsVideo = false,
  allowsAudio = false
}: PhotoInputProps) {
  return (
    <div className="mt-2">
      <div className="flex flex-wrap gap-2">
        {allowsPhoto && (
          <Button size="sm" variant="outline" onClick={onAddMedia} className="flex items-center gap-1">
            <Camera className="h-4 w-4" />
            <span>Adicionar Foto</span>
          </Button>
        )}
        
        {allowsVideo && (
          <Button size="sm" variant="outline" onClick={onAddMedia} className="flex items-center gap-1">
            <Video className="h-4 w-4" />
            <span>Adicionar Vídeo</span>
          </Button>
        )}
        
        {allowsAudio && (
          <Button size="sm" variant="outline" onClick={onAddMedia} className="flex items-center gap-1">
            <Mic className="h-4 w-4" />
            <span>Adicionar Áudio</span>
          </Button>
        )}
      </div>
      
      {mediaUrls && mediaUrls.length > 0 && (
        <div className="mt-2 grid grid-cols-3 gap-2">
          {mediaUrls.map((url: string, i: number) => (
            <div key={i} className="relative aspect-square rounded border overflow-hidden">
              <img 
                src={url} 
                alt={`Mídia ${i+1}`} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
