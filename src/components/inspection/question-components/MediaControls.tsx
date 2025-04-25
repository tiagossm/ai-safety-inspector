import React from "react";
import { Button } from "@/components/ui/button";
import { Camera, Video, File, Mic } from "lucide-react";

interface MediaControlsProps {
  allowsPhoto?: boolean;
  allowsVideo?: boolean;
  allowsAudio?: boolean;
  allowsFiles?: boolean;
  handleAddMedia: () => void;
}

export const MediaControls: React.FC<MediaControlsProps> = ({
  allowsPhoto = false,
  allowsVideo = false,
  allowsAudio = false,
  allowsFiles = false,
  handleAddMedia
}) => {
  // If no media is allowed, don't render anything
  if (!allowsPhoto && !allowsVideo && !allowsAudio && !allowsFiles) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {allowsPhoto && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddMedia}
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
          onClick={handleAddMedia}
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
          onClick={handleAddMedia}
          className="flex items-center"
        >
          <Mic className="h-4 w-4 mr-2" />
          <span>Áudio</span>
        </Button>
      )}
      
      {allowsFiles && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddMedia}
          className="flex items-center"
        >
          <File className="h-4 w-4 mr-2" />
          <span>Arquivo</span>
        </Button>
      )}
    </div>
  );
};
