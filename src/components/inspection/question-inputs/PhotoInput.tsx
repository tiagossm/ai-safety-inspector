
import React from "react";
import { Button } from "@/components/ui/button";
import { File, FileVideo, Mic, Camera, Plus } from "lucide-react";
import { MediaAttachments } from "./MediaAttachments";

interface PhotoInputProps {
  mediaUrls?: string[];
  onAddMedia: () => void;
  onDeleteMedia?: (urlToDelete: string) => void;
  allowsPhoto?: boolean;
  allowsVideo?: boolean;
  allowsAudio?: boolean;
  allowsFiles?: boolean;
}

export function PhotoInput({
  mediaUrls = [],
  onAddMedia,
  onDeleteMedia,
  allowsPhoto = true,
  allowsVideo = false,
  allowsAudio = false,
  allowsFiles = false
}: PhotoInputProps) {
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-2">
        {allowsPhoto && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-xs flex items-center gap-1"
            onClick={onAddMedia}
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Foto</span>
          </Button>
        )}
        
        {allowsVideo && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-xs flex items-center gap-1"
            onClick={onAddMedia}
          >
            <FileVideo className="h-3.5 w-3.5" />
            <span>Vídeo</span>
          </Button>
        )}
        
        {allowsAudio && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-xs flex items-center gap-1"
            onClick={onAddMedia}
          >
            <Mic className="h-3.5 w-3.5" />
            <span>Áudio</span>
          </Button>
        )}
        
        {allowsFiles && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-xs flex items-center gap-1"
            onClick={onAddMedia}
          >
            <File className="h-3.5 w-3.5" />
            <span>Arquivo</span>
          </Button>
        )}
        
        {!allowsPhoto && !allowsVideo && !allowsAudio && !allowsFiles && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-xs flex items-center gap-1"
            onClick={onAddMedia}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Anexar</span>
          </Button>
        )}
      </div>
      
      <MediaAttachments mediaUrls={mediaUrls} onDelete={onDeleteMedia} />
    </div>
  );
}
