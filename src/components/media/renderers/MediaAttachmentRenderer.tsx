
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
  onOpenAnalysis: (url: string, questionText?: string) => void;
  onDelete?: (url: string) => void;
  readOnly: boolean;
  questionText?: string;
  analysisResults?: Record<string, any>;
  smallSize?: boolean; // Add prop for smaller images
}

export const MediaAttachmentRenderer = ({ 
  url, 
  index, 
  onOpenPreview, 
  onOpenAnalysis, 
  onDelete,
  readOnly,
  questionText,
  analysisResults,
  smallSize = false
}: MediaAttachmentRendererProps) => {
  const fileType = getFileType(url);
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
  
  const hasAnalysis = analysisResults && analysisResults[url];
  
  // Tratamento especial para arquivos webm (podem ser áudio ou vídeo)
  if (url.endsWith('.webm')) {
    // Se o URL contiver "audio", consideramos como áudio
    if (url.includes('audio')) {
      return (
        <AudioRenderer 
          url={url}
          index={index}
          fileName={fileName}
          onOpenPreview={onOpenPreview}
          onOpenAnalysis={(url) => onOpenAnalysis(url, questionText)}
          readOnly={readOnly}
          onDelete={onDelete}
          onDownload={handleDownload}
          hasAnalysis={hasAnalysis}
          questionText={questionText}
          smallSize={smallSize}
        />
      );
    } else {
      return (
        <VideoRenderer 
          url={url}
          index={index}
          fileName={fileName}
          onOpenPreview={onOpenPreview}
          onOpenAnalysis={(url) => onOpenAnalysis(url, questionText)}
          readOnly={readOnly}
          onDelete={onDelete}
          hasAnalysis={hasAnalysis}
          questionText={questionText}
          smallSize={smallSize}
        />
      );
    }
  }
  
  // Handle images
  if (fileType === 'image') {
    return (
      <ImageRenderer 
        url={url}
        index={index}
        fileName={fileName}
        onOpenPreview={onOpenPreview}
        onOpenAnalysis={(url) => onOpenAnalysis(url, questionText)}
        readOnly={readOnly}
        onDelete={onDelete}
        hasAnalysis={hasAnalysis}
        questionText={questionText}
        smallSize={smallSize}
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
        onOpenAnalysis={(url) => onOpenAnalysis(url, questionText)}
        readOnly={readOnly}
        onDelete={onDelete}
        onDownload={handleDownload}
        hasAnalysis={hasAnalysis}
        questionText={questionText}
        smallSize={smallSize}
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
        onOpenAnalysis={(url) => onOpenAnalysis(url, questionText)}
        readOnly={readOnly}
        onDelete={onDelete}
        hasAnalysis={hasAnalysis}
        questionText={questionText}
        smallSize={smallSize}
      />
    );
  }
  
  // For other file types, we need to identify specific types by extension
  const extension = url.split('.').pop()?.toLowerCase() || '';
  
  // Determine specific file type based on extension
  const specificFileType = determineSpecificFileType(extension);
  
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
        smallSize={smallSize}
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
      smallSize={smallSize}
    />
  );
};
