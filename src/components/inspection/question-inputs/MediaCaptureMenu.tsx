
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Camera, Mic, Video, Upload, 
  File, X, MoreHorizontal 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MediaCaptureMenuProps {
  onAddMedia: () => void;
  mediaUrls?: string[];
}

export function MediaCaptureMenu({ onAddMedia, mediaUrls }: MediaCaptureMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Count media by type
  const getMediaCounts = () => {
    if (!mediaUrls || !mediaUrls.length) return null;
    
    const counts = {
      images: 0,
      videos: 0,
      audios: 0,
      files: 0
    };
    
    mediaUrls.forEach(url => {
      if (url.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i)) {
        counts.images++;
      } else if (url.match(/\.(mp4|webm|mov|avi)$/i)) {
        counts.videos++;
      } else if (url.match(/\.(mp3|wav|ogg|m4a)$/i)) {
        counts.audios++;
      } else {
        counts.files++;
      }
    });
    
    return counts;
  };
  
  const mediaCounts = getMediaCounts();
  const hasMedia = mediaUrls && mediaUrls.length > 0;
  
  return (
    <div className="mt-2">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2 text-xs"
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Mídia</span>
            {hasMedia && (
              <Badge variant="secondary" className="ml-1">
                {mediaUrls.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={onAddMedia} className="cursor-pointer">
            <Camera className="h-4 w-4 mr-2" />
            <span>Capturar foto</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onAddMedia} className="cursor-pointer">
            <Video className="h-4 w-4 mr-2" />
            <span>Gravar vídeo (15s)</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onAddMedia} className="cursor-pointer">
            <Mic className="h-4 w-4 mr-2" />
            <span>Gravar áudio</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onAddMedia} className="cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            <span>Enviar arquivo</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {mediaCounts && (
        <div className="mt-1.5 text-xs text-muted-foreground">
          {mediaCounts.images > 0 && (
            <span className="mr-2">
              <Camera className="h-3 w-3 inline mr-1" />
              {mediaCounts.images}
            </span>
          )}
          {mediaCounts.videos > 0 && (
            <span className="mr-2">
              <Video className="h-3 w-3 inline mr-1" />
              {mediaCounts.videos}
            </span>
          )}
          {mediaCounts.audios > 0 && (
            <span className="mr-2">
              <Mic className="h-3 w-3 inline mr-1" />
              {mediaCounts.audios}
            </span>
          )}
          {mediaCounts.files > 0 && (
            <span>
              <File className="h-3 w-3 inline mr-1" />
              {mediaCounts.files}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Add the missing Badge component
import { Badge } from "@/components/ui/badge";
