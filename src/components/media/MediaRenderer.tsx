import React, { useState, useEffect } from "react";
import { getFileType } from "@/utils/fileUtils";

interface MediaRendererProps {
  url: string;
  className?: string;
}

export function MediaRenderer({ url, className = "" }: MediaRendererProps) {
  const [error, setError] = useState(false);
  const fileType = getFileType(url);

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

  switch (fileType) {
    case "image":
      return (
        <div className={`flex items-center justify-center ${className}`}>
          <img
            src={url}
            alt="Prévia"
            className="w-auto max-w-full h-auto max-h-48 object-cover rounded-lg border"
            onError={handleError}
          />
        </div>
      );
    case "video":
      return (
        <video
          src={url}
          controls
          className={`max-w-full max-h-64 rounded-lg border ${className}`}
          onError={handleError}
        />
      );
    case "audio":
      return (
        <audio
          src={url}
          controls
          className={className}
          onError={handleError}
        />
      );
    default:
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          Baixar arquivo
        </a>
      );
  }
}
