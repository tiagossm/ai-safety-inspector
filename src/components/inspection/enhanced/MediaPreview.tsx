
import React from "react";
import { Image, Video, FileText, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaPreviewProps {
  url: string;
  onPreview: () => void;
  onRemove?: () => void;
  size?: "sm" | "md" | "lg";
  showRemoveButton?: boolean;
}

export function MediaPreview({
  url,
  onPreview,
  onRemove,
  size = "md",
  showRemoveButton = true
}: MediaPreviewProps) {
  // Determine media type based on URL
  const isImage = url.match(/\.(jpeg|jpg|gif|png|webp)$/i) !== null;
  const isVideo = url.match(/\.(mp4|webm|mov|ogg|avi)$/i) !== null;
  const isAudio = url.match(/\.(mp3|wav|ogg|m4a|webm)$/i) !== null;
  
  // Set width and height based on size prop
  const dimensions = {
    sm: "h-12 w-12",
    md: "h-16 w-16",
    lg: "h-24 w-24"
  };
  
  const iconSize = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };
  
  const removeButtonSize = {
    sm: "h-4 w-4 -top-1 -right-1",
    md: "h-5 w-5 -top-2 -right-2", 
    lg: "h-6 w-6 -top-2 -right-2"
  };
  
  return (
    <div className={`relative group ${dimensions[size]} rounded-md overflow-hidden bg-muted`}>
      {/* Preview content */}
      <div 
        className="h-full w-full cursor-pointer flex items-center justify-center"
        onClick={onPreview}
      >
        {isImage ? (
          <img 
            src={url} 
            alt="Preview" 
            className="h-full w-full object-cover"
          />
        ) : isVideo ? (
          <div className="h-full w-full flex items-center justify-center bg-black/10">
            <Video className={`${iconSize[size]} text-primary`} />
          </div>
        ) : isAudio ? (
          <div className="h-full w-full flex items-center justify-center bg-blue-50">
            <FileText className={`${iconSize[size]} text-blue-500`} />
          </div>
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <File className={`${iconSize[size]} text-gray-400`} />
          </div>
        )}
      </div>
      
      {/* Remove button */}
      {showRemoveButton && onRemove && (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className={`absolute ${removeButtonSize[size]} rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
