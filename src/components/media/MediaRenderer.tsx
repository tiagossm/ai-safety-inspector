
import React, { useState, useEffect } from "react";
import { getFileType } from "@/utils/fileUtils";

interface MediaRendererProps {
  url: string;
  className?: string;
}

export function MediaRenderer({ url, className = "" }: MediaRendererProps) {
  const [error, setError] = useState(false);
  const fileType = getFileType(url);
  
  // Reset error state when URL changes
  useEffect(() => {
    setError(false);
  }, [url]);

  const handleError = () => {
    console.error(`Error loading media: ${url}`);
    setError(true);
  };

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 p-4 ${className}`}>
        <p className="text-sm text-gray-500">Não foi possível carregar a mídia</p>
      </div>
    );
  }

  // Render different types of media based on file type
  switch (fileType) {
    case "image":
      return (
        <div className={`flex items-center justify-center ${className}`}>
          <img 
            src={url} 
            alt="Media content" 
            className="max-w-full max-h-full object-contain" 
            onError={handleError}
          />
        </div>
      );
    
    case "video":
      return (
        <video 
          src={url} 
          controls
          className={`max-h-full max-w-full ${className}`}
          onError={handleError}
        />
      );
    
    case "audio":
      return (
        <div className={`flex flex-col items-center justify-center p-2 ${className}`}>
          <audio 
            src={url} 
            controls
            className="w-full" 
            onError={handleError}
          />
          <p className="text-xs text-gray-500 mt-1">Arquivo de áudio</p>
        </div>
      );
    
    default:
      // For files that can't be displayed directly
      return (
        <div className={`flex items-center justify-center bg-gray-100 p-4 ${className}`}>
          <p className="text-sm text-gray-500">Arquivo não suportado para visualização</p>
        </div>
      );
  }
}
