
import React from "react";
import { getFileType } from "@/utils/fileUtils";

interface MediaRendererProps {
  url: string;
  className?: string;
}

export const MediaRenderer: React.FC<MediaRendererProps> = ({ url, className = '' }) => {
  const fileType = getFileType(url);

  if (fileType === 'image') {
    return (
      <img 
        src={url} 
        alt="Media content" 
        className={className} 
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iNiIgZmlsbD0iI2Y2ZjZmNiIvPjxwYXRoIGQ9Ik0yNSA1NEwzNSA1M0wzNSA0MUwyNSA0MCIgc3Ryb2tlPSIjZTJlMmUyIiBzdHJva2Utd2lkdGg9IjQiLz48L3N2Zz4=";
        }}
      />
    );
  }

  if (fileType === 'video') {
    return (
      <video 
        src={url} 
        controls 
        className={className}
      />
    );
  }

  if (fileType === 'audio') {
    return (
      <audio 
        src={url} 
        controls 
        className={className}
      />
    );
  }

  // For documents and other file types, show a placeholder
  return (
    <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
      <span className="text-sm text-gray-500">File preview not available</span>
    </div>
  );
};

// Re-export the MediaGallery to maintain backward compatibility
export { MediaGallery } from "./renderers/MediaGalleryGrid";
