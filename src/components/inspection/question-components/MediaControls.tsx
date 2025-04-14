
import React from "react";
import { Button } from "@/components/ui/button";

interface MediaControlsProps {
  allowsPhoto: boolean;
  allowsVideo: boolean;
  allowsAudio: boolean;
  handleAddMedia: () => void;
}

export function MediaControls({ 
  allowsPhoto, 
  allowsVideo, 
  allowsAudio, 
  handleAddMedia 
}: MediaControlsProps) {
  if (!allowsPhoto && !allowsVideo && !allowsAudio) {
    return null;
  }
  
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {allowsPhoto && (
        <Button size="sm" variant="outline" onClick={handleAddMedia}>
          Adicionar Foto
        </Button>
      )}
      {allowsVideo && (
        <Button size="sm" variant="outline" onClick={handleAddMedia}>
          Adicionar Vídeo
        </Button>
      )}
      {allowsAudio && (
        <Button size="sm" variant="outline" onClick={handleAddMedia}>
          Adicionar Áudio
        </Button>
      )}
    </div>
  );
}
