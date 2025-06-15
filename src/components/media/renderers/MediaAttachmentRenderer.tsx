
import React from "react";
import { getFileType, getFilenameFromUrl } from "@/utils/fileUtils";
import { determineSpecificFileType } from "@/utils/fileTypeUtils";
import { toast } from "sonner";
import { ImageRenderer, AudioRenderer, VideoRenderer, DocumentRenderer, GenericFileRenderer } from "./MediaTypeRenderer";
import { MediaGallery } from "./MediaGalleryGrid";
import { FileText, FileAudio, FileVideo, FileImage, ExternalLink } from "lucide-react";

// Layout responsivo flexível otimizado
function getGridColumns(count: number, smallSize: boolean = false) {
  if (smallSize) {
    // Para smallSize, usar layout mais compacto
    if (count <= 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count === 3) return "grid-cols-3";
    return "grid-cols-4";
  }
  
  if (count <= 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-1 sm:grid-cols-2";
  if (count === 3) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
  if (count >= 4 && count <= 6) return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4";
  if (count > 6) return "grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-6";
  return "grid-cols-1";
}

interface MediaAttachmentRendererProps {
  urls: string[];
  onOpenPreview: (url: string) => void;
  onOpenAnalysis: (url: string, questionText?: string) => void;
  onDelete?: (url: string) => void;
  readOnly: boolean;
  questionText?: string;
  analysisResults?: Record<string, any>;
  smallSize?: boolean;
}

const fileTypeIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="text-blue-700 w-4 h-4 mb-1" />,
  audio: <FileAudio className="text-pink-600 w-4 h-4 mb-1" />,
  video: <FileVideo className="text-violet-600 w-4 h-4 mb-1" />,
  image: <FileImage className="text-green-600 w-4 h-4 mb-1" />,
  word: <FileText className="text-sky-700 w-4 h-4 mb-1" />,
  excel: <FileText className="text-green-700 w-4 h-4 mb-1" />,
  code: <FileText className="text-gray-700 w-4 h-4 mb-1" />,
  zip: <FileText className="text-yellow-700 w-4 h-4 mb-1" />,
  presentation: <FileText className="text-orange-700 w-4 h-4 mb-1" />,
  file: <FileText className="text-gray-400 w-4 h-4 mb-1" />,
};

// Placeholder visual otimizado para tamanhos pequenos
const CompactFilePreview = ({
  url,
  fileName,
  type,
  smallSize = false
}: {
  url: string;
  fileName: string;
  type: string;
  smallSize?: boolean;
}) => {
  const truncatedName = fileName.length > 15 ? fileName.substring(0, 12) + '...' : fileName;
  
  return (
    <div className={`flex flex-col items-center justify-center border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors ${
      smallSize ? 'p-1 min-w-[60px] max-w-[80px] h-16' : 'p-2 min-w-[100px] max-w-[140px] h-20'
    }`}>
      <div className="flex flex-col items-center justify-center flex-1">
        {fileTypeIcons[type] || fileTypeIcons.file}
        <span className={`${smallSize ? 'text-[9px]' : 'text-[10px]'} font-medium text-gray-600 text-center leading-tight`}>
          {truncatedName}
        </span>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${smallSize ? 'text-[8px]' : 'text-[9px]'} text-blue-500 hover:text-blue-700 flex items-center gap-1 mt-1`}
        aria-label={`Abrir ${fileName}`}
      >
        <ExternalLink className="w-2 h-2" />
        Abrir
      </a>
    </div>
  );
};

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

  console.log('[MediaAttachmentRenderer] Renderizando URLs:', urls);

  // Função de download única
  const handleDownload = (url: string, filename: string) => {
    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "download";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      toast.error("Não foi possível fazer o download do arquivo");
      console.error("Erro no download:", error);
    }
  };

  // Se todos forem imagem (e mais que 1), usar galeria compacta.
  const allImages = urls.every((u) => getFileType(u) === "image");
  if (allImages && urls.length > 1) {
    return (
      <MediaGallery
        urls={urls}
        analysisResults={analysisResults}
        onOpenPreview={onOpenPreview}
        onOpenAnalysis={onOpenAnalysis}
        onDelete={readOnly ? undefined : onDelete}
        readOnly={readOnly}
        questionText={questionText}
        columns={Math.min(smallSize ? 3 : 4, Math.ceil(Math.sqrt(urls.length)))}
        maxThumbSize={smallSize ? 40 : 80}
      />
    );
  }

  // Grid para múltiplos tipos juntos
  return (
    <div className={`grid gap-1 ${getGridColumns(urls.length, smallSize)}`}>
      {urls.map((url, index) => {
        const fileType = getFileType(url);
        const fileName = getFilenameFromUrl(url);
        const hasAnalysis = analysisResults && analysisResults[url];
        const extension = url.split(".").pop()?.toLowerCase() || "";
        const specificFileType = determineSpecificFileType(extension);

        // Verifica .webm de áudio
        const isWebm = extension === "webm";
        const isWebmAudio = isWebm && (
          url.toLowerCase().includes('/audio/') ||
          url.toLowerCase().endsWith('audio.webm')
        );

        // Imagem avulsa (não entra na galeria)
        if (fileType === "image") {
          return (
            <ImageRenderer
              key={url}
              url={url}
              index={index}
              fileName={fileName}
              onOpenPreview={onOpenPreview}
              onOpenAnalysis={readOnly ? () => {} : onOpenAnalysis}
              readOnly={readOnly}
              onDelete={readOnly ? undefined : onDelete}
              hasAnalysis={hasAnalysis}
              questionText={questionText}
              smallSize={smallSize}
            />
          );
        }

        // PDF e outros documentos - placeholder compacto
        if (specificFileType === "pdf" || fileType === "document") {
          return (
            <CompactFilePreview 
              key={url} 
              url={url} 
              fileName={fileName} 
              type={specificFileType} 
              smallSize={smallSize} 
            />
          );
        }

        // Áudio: render com ícone compacto
        if (fileType === "audio" || isWebmAudio) {
          return (
            <AudioRenderer
              key={url}
              url={url}
              index={index}
              fileName={fileName}
              onOpenPreview={onOpenPreview}
              onOpenAnalysis={readOnly ? () => {} : onOpenAnalysis}
              readOnly={readOnly}
              onDelete={readOnly ? undefined : onDelete}
              onDownload={handleDownload}
              hasAnalysis={hasAnalysis}
              questionText={questionText}
              smallSize={smallSize}
            />
          );
        }

        // Vídeo (inclui .webm sem heurística de áudio)
        if (fileType === "video" || (isWebm && !isWebmAudio)) {
          return (
            <VideoRenderer
              key={url}
              url={url}
              index={index}
              fileName={fileName}
              onOpenPreview={onOpenPreview}
              onOpenAnalysis={readOnly ? () => {} : onOpenAnalysis}
              readOnly={readOnly}
              onDelete={readOnly ? undefined : onDelete}
              hasAnalysis={hasAnalysis}
              questionText={questionText}
              smallSize={smallSize}
            />
          );
        }

        // Outros tipos de arquivo
        return (
          <CompactFilePreview
            key={url}
            url={url}
            fileName={fileName}
            type={specificFileType}
            smallSize={smallSize}
          />
        );
      })}
    </div>
  );
}
