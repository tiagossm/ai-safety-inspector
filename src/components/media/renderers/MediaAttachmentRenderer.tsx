
import React from "react";
import { getFileType, getFilenameFromUrl } from "@/utils/fileUtils";
import { determineSpecificFileType } from "@/utils/fileTypeUtils";
import { toast } from "sonner";
import { ImageRenderer, AudioRenderer, VideoRenderer, DocumentRenderer, GenericFileRenderer } from "./MediaTypeRenderer";
import { MediaGallery } from "./MediaGalleryGrid";

interface MediaAttachmentRendererProps {
  urls: string[]; // <- agora aceita array
  onOpenPreview: (url: string) => void;
  onOpenAnalysis: (url: string, questionText?: string) => void;
  onDelete?: (url: string) => void;
  readOnly: boolean;
  questionText?: string;
  analysisResults?: Record<string, any>;
  smallSize?: boolean;
}

export const MediaAttachmentRenderer = ({
  urls = [],
  onOpenPreview,
  onOpenAnalysis,
  onDelete,
  readOnly,
  questionText,
  analysisResults = {},
  smallSize = false
}: MediaAttachmentRendererProps) => {
  if (!urls || urls.length === 0) return null;

  // Função de download (única para todos os tipos)
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

  // Se todos forem imagem, mostra a galeria
  const allImages = urls.every((u) => getFileType(u) === 'image');
  if (allImages && urls.length > 1) {
    return (
      <MediaGallery
        urls={urls}
        analysisResults={analysisResults}
        onOpenPreview={onOpenPreview}
        onOpenAnalysis={onOpenAnalysis}
        onDelete={onDelete}
        readOnly={readOnly}
        questionText={questionText}
        columns={Math.min(5, Math.ceil(Math.sqrt(urls.length)))}
        maxThumbSize={smallSize ? 75 : 90}
      />
    );
  }

  // Caso misto ou não-imagem, renderiza cada arquivo conforme tipo
  return (
    <div className="flex flex-wrap gap-2">
      {urls.map((url, index) => {
        const fileType = getFileType(url);
        const fileName = getFilenameFromUrl(url);
        const hasAnalysis = analysisResults && analysisResults[url];
        const extension = url.split('.').pop()?.toLowerCase() || '';
        const specificFileType = determineSpecificFileType(extension);

        // Video ou áudio .webm (lógica preservada)
        if (url.endsWith('.webm')) {
          if (url.includes('audio')) {
            return (
              <AudioRenderer
                key={url}
                url={url}
                index={index}
                fileName={fileName}
                onOpenPreview={onOpenPreview}
                onOpenAnalysis={onOpenAnalysis}
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
                key={url}
                url={url}
                index={index}
                fileName={fileName}
                onOpenPreview={onOpenPreview}
                onOpenAnalysis={onOpenAnalysis}
                readOnly={readOnly}
                onDelete={onDelete}
                hasAnalysis={hasAnalysis}
                questionText={questionText}
                smallSize={smallSize}
              />
            );
          }
        }

        // Imagem avulsa (não entra na galeria)
        if (fileType === 'image') {
          return (
            <ImageRenderer
              key={url}
              url={url}
              index={index}
              fileName={fileName}
              onOpenPreview={onOpenPreview}
              onOpenAnalysis={onOpenAnalysis}
              readOnly={readOnly}
              onDelete={onDelete}
              hasAnalysis={hasAnalysis}
              questionText={questionText}
              smallSize={smallSize}
            />
          );
        }

        // Áudio
        if (fileType === 'audio') {
          return (
            <AudioRenderer
              key={url}
              url={url}
              index={index}
              fileName={fileName}
              onOpenPreview={onOpenPreview}
              onOpenAnalysis={onOpenAnalysis}
              readOnly={readOnly}
              onDelete={onDelete}
              onDownload={handleDownload}
              hasAnalysis={hasAnalysis}
              questionText={questionText}
              smallSize={smallSize}
            />
          );
        }

        // Vídeo
        if (fileType === 'video') {
          return (
            <VideoRenderer
              key={url}
              url={url}
              index={index}
              fileName={fileName}
              onOpenPreview={onOpenPreview}
              onOpenAnalysis={onOpenAnalysis}
              readOnly={readOnly}
              onDelete={onDelete}
              hasAnalysis={hasAnalysis}
              questionText={questionText}
              smallSize={smallSize}
            />
          );
        }

        // PDF
        if (specificFileType === 'pdf') {
          return (
            <DocumentRenderer
              key={url}
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

        // Qualquer outro tipo
        return (
          <GenericFileRenderer
            key={url}
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
      })}
    </div>
  );
}
