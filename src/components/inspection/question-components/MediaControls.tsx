
import React from "react";
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
  // Se não houver nenhuma opção de mídia habilitada, não renderiza nada
  if (!allowsPhoto && !allowsVideo && !allowsAudio && !allowsFiles) return null;

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
