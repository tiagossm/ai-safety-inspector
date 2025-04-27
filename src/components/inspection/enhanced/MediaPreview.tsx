
import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, Video, Mic, File } from "lucide-react";

interface MediaPreviewProps {
  url: string;
  onPreview: (url: string) => void;
  onRemove: (url: string) => void;
}

export function MediaPreview({ url, onPreview, onRemove }: MediaPreviewProps) {
  // Check for media types
  const isImage = url.match(/\.(jpeg|jpg|gif|png|webp)$/i);
  const isVideo = url.match(/\.(mp4|webm|mov|ogg|avi)$/i);
  const isAudio = url.match(/\.(mp3|wav|ogg|m4a|webm)$/i);

  if (isImage) {
    return (
      <div className="relative group hover:opacity-90 transition-opacity">
        <img src={url} alt="Media preview" className="h-16 w-16 object-cover rounded-md" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 bg-white/30 hover:bg-white/50"
            onClick={() => onPreview(url)}
          >
            <Eye className="h-4 w-4 text-white" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 bg-white/30 hover:bg-red-500/50 ml-1"
            onClick={() => onRemove(url)}
          >
            <Trash2 className="h-4 w-4 text-white" />
          </Button>
        </div>
      </div>
    );
  }

  // Choose appropriate icon based on media type
  const IconComponent = isVideo ? Video : isAudio ? Mic : File;
  
  // For non-image files, show an icon with the file type
  return (
    <div className="relative group hover:opacity-90 transition-opacity">
      <div className="h-16 w-16 flex items-center justify-center bg-muted rounded-md">
        <IconComponent className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8 bg-white/30 hover:bg-white/50"
          onClick={() => onPreview(url)}
        >
          <Eye className="h-4 w-4 text-white" />
        </Button>
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8 bg-white/30 hover:bg-red-500/50 ml-1"
          onClick={() => onRemove(url)}
        >
          <Trash2 className="h-4 w-4 text-white" />
        </Button>
      </div>
    </div>
  );
}
