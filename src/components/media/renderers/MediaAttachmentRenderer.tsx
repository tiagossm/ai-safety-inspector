
import React from "react";
import { X, ZoomIn, Sparkles, Download } from "lucide-react";
import { getFileType, getFilenameFromUrl } from "@/utils/fileUtils";
import { determineSpecificFileType } from "@/utils/fileTypeUtils";
import { toast } from "sonner";
import { ImageRenderer, AudioRenderer, VideoRenderer, DocumentRenderer, GenericFileRenderer } from "./MediaTypeRenderer";

interface MediaAttachmentRendererProps {
  url: string;
  index: number;
  onOpenPreview: (url: string) => void;
  onOpenAnalysis: (url: string) => void;
  onDelete?: (url: string) => void;
  readOnly: boolean;
}

export const MediaAttachmentRenderer = ({ 
  url, 
  index, 
  onOpenPreview, 
  onOpenAnalysis, 
  onDelete,
  readOnly
}: MediaAttachmentRendererProps) => {
  const fileType = getFileType(url);
  console.log(`Detected file type: ${fileType}`);
  const fileName = getFilenameFromUrl(url);
  
  const handleDownload = (url: string, filename: string) => {
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      toast.error('Não foi possível fazer o download do arquivo');
      console.error('Erro no download:', error);
    }
  };
  
  // Handle images
  if (fileType === 'image') {
    return (
      <ImageRenderer 
        url={url}
        index={index}
        fileName={fileName}
        onOpenPreview={onOpenPreview}
        onOpenAnalysis={onOpenAnalysis}
        readOnly={readOnly}
        onDelete={onDelete}
      />
    );
  }
  
  // Handle audio
  if (fileType === 'audio') {
    return (
      <AudioRenderer 
        url={url}
        index={index}
        fileName={fileName}
        onOpenPreview={onOpenPreview}
        onOpenAnalysis={onOpenAnalysis}
        readOnly={readOnly}
        onDelete={onDelete}
        onDownload={handleDownload}
      />
    );
  }
  
  // Handle video
  if (fileType === 'video') {
    return (
      <VideoRenderer 
        url={url}
        index={index}
        fileName={fileName}
        onOpenPreview={onOpenPreview}
        onOpenAnalysis={onOpenAnalysis}
        readOnly={readOnly}
        onDelete={onDelete}
      />
    );
  }
  
  // For other file types, we need to identify specific types by extension
  const extension = url.split('.').pop()?.toLowerCase() || '';
  console.log(`Extension detected: ${extension}`);
  
  // Determine specific file type based on extension
  const specificFileType = determineSpecificFileType(extension);
  console.log(`Specific file type: ${specificFileType}`);
  
  // Handle PDF
  if (specificFileType === 'pdf') {
    return (
      <DocumentRenderer 
        url={url}
        index={index}
        fileName={fileName}
        onOpenPreview={onOpenPreview}
        readOnly={readOnly}
        onDelete={onDelete}
        specificFileType={specificFileType}
      />
    );
  }
  
  // Handle other types of files
  return (
    <GenericFileRenderer 
      url={url}
      index={index}
      fileName={fileName}
      specificFileType={specificFileType}
      onDownload={handleDownload}
      readOnly={readOnly}
      onDelete={onDelete}
    />
  );
};
