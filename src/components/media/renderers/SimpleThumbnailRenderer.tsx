
import React from 'react';
import { getFileType, getFilenameFromUrl } from "@/utils/fileUtils";
import { determineSpecificFileType } from "@/utils/fileTypeUtils";
import { FileText, FileAudio, FileVideo, FileImage, ExternalLink, Eye } from "lucide-react";

interface SimpleThumbnailRendererProps {
  urls: string[];
  onOpenPreview?: (url: string) => void;
  maxItems?: number;
}

const fileTypeIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="text-blue-700 w-3 h-3" />,
  audio: <FileAudio className="text-pink-600 w-3 h-3" />,
  video: <FileVideo className="text-violet-600 w-3 h-3" />,
  image: <FileImage className="text-green-600 w-3 h-3" />,
  word: <FileText className="text-sky-700 w-3 h-3" />,
  excel: <FileText className="text-green-700 w-3 h-3" />,
  code: <FileText className="text-gray-700 w-3 h-3" />,
  zip: <FileText className="text-yellow-700 w-3 h-3" />,
  presentation: <FileText className="text-orange-700 w-3 h-3" />,
  file: <FileText className="text-gray-400 w-3 h-3" />,
};

export const SimpleThumbnailRenderer = ({ 
  urls = [], 
  onOpenPreview = () => {}, 
  maxItems = 3 
}: SimpleThumbnailRendererProps) => {
  if (!urls || urls.length === 0) return null;

  const displayUrls = urls.slice(0, maxItems);
  const remainingCount = urls.length - maxItems;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {displayUrls.map((url, index) => {
        const fileType = getFileType(url);
        const fileName = getFilenameFromUrl(url);
        const extension = url.split(".").pop()?.toLowerCase() || "";
        const specificFileType = determineSpecificFileType(extension);
        
        // Para imagens, mostrar miniatura real
        if (fileType === "image") {
          return (
            <button
              key={url}
              onClick={() => onOpenPreview(url)}
              className="relative group w-8 h-8 rounded border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors"
              title={fileName}
            >
              <img 
                src={url} 
                alt={fileName}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                <Eye className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          );
        }

        // Para outros tipos, mostrar ícone compacto
        return (
          <div
            key={url}
            className="flex items-center gap-1 px-1.5 py-1 bg-gray-50 rounded border border-gray-200 text-xs"
            title={fileName}
          >
            {fileTypeIcons[specificFileType] || fileTypeIcons.file}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 flex items-center gap-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-2 h-2" />
            </a>
          </div>
        );
      })}
      
      {remainingCount > 0 && (
        <span className="text-xs text-gray-500 px-1">
          +{remainingCount} mais
        </span>
      )}
    </div>
  );
};
