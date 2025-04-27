
import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, Video, Mic, File, Image } from "lucide-react";

interface MediaPreviewProps {
  url: string;
  onPreview: (url: string) => void;
  onRemove: (url: string) => void;
}

export function MediaPreview({ url, onPreview, onRemove }: MediaPreviewProps) {
  // Check for media types
  const isImage = url.match(/\.(jpeg|jpg|gif|png|webp)$/i) !== null;
  const isVideo = url.match(/\.(mp4|webm|mov|ogg|avi)$/i) !== null;
  const isAudio = url.match(/\.(mp3|wav|ogg|m4a|webm)$/i) !== null;

  // Get appropriate icon component based on file type
  const getIconComponent = () => {
    if (isVideo) return Video;
    if (isAudio) return Mic;
    if (!isImage) return File;
    return Image;
  };
  
  const IconComponent = getIconComponent();

  // For images, show a thumbnail
  if (isImage) {
    return (
      <div className="relative group hover:opacity-90 transition-opacity">
        <img 
          src={url} 
          alt="Media preview" 
          className="h-16 w-16 object-cover rounded-md"
          onError={(e) => {
            // If image fails to load, replace with an icon
            e.currentTarget.style.display = 'none';
            const div = e.currentTarget.parentElement;
            if (div) {
              const iconDiv = document.createElement('div');
              iconDiv.className = "h-16 w-16 flex items-center justify-center bg-muted rounded-md";
              iconDiv.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8 text-muted-foreground"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>';
              div.appendChild(iconDiv);
            }
          }}
        />
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
  
  // For non-image files, show an icon with the file type indicator
  return (
    <div className="relative group hover:opacity-90 transition-opacity">
      <div className="h-16 w-16 flex flex-col items-center justify-center bg-muted rounded-md">
        <IconComponent className="h-8 w-8 text-muted-foreground" />
        <span className="text-xs text-muted-foreground mt-1">
          {isVideo ? 'Vídeo' : isAudio ? 'Áudio' : 'Arquivo'}
        </span>
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
