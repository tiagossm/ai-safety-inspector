
import React, { useEffect } from "react";
import { FileText, Image, Mic, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaControlsProps {
  allowsPhoto: boolean;
  allowsVideo: boolean;
  allowsAudio: boolean;
  allowsFiles: boolean;
  handleAddMedia: () => void;
}

export function MediaControls({
  allowsPhoto,
  allowsVideo,
  allowsAudio,
  allowsFiles,
  handleAddMedia
}: MediaControlsProps) {
  // Debug logging
  useEffect(() => {
    console.log("MediaControls rendered with props:", { 
      allowsPhoto, 
      allowsVideo, 
      allowsAudio, 
      allowsFiles 
    });
  }, [allowsPhoto, allowsVideo, allowsAudio, allowsFiles]);
  
  // If no media options are enabled, don't render anything
  if (!allowsPhoto && !allowsVideo && !allowsAudio && !allowsFiles) {
    console.log("No media types allowed, hiding media controls");
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {allowsPhoto && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="flex items-center gap-1"
          onClick={handleAddMedia}
        >
          <Image className="h-3.5 w-3.5" />
          <span className="text-xs">Foto</span>
        </Button>
      )}
      
      {allowsVideo && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="flex items-center gap-1"
          onClick={handleAddMedia}
        >
          <Video className="h-3.5 w-3.5" />
          <span className="text-xs">Vídeo</span>
        </Button>
      )}
      
      {allowsAudio && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="flex items-center gap-1"
          onClick={handleAddMedia}
        >
          <Mic className="h-3.5 w-3.5" />
          <span className="text-xs">Áudio</span>
        </Button>
      )}
      
      {allowsFiles && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="flex items-center gap-1"
          onClick={handleAddMedia}
        >
          <FileText className="h-3.5 w-3.5" />
          <span className="text-xs">Arquivo</span>
        </Button>
      )}
    </div>
  );
}
