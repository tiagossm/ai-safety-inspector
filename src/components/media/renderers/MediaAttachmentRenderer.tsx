import React from "react";
import { getFileType, getFilenameFromUrl } from "@/utils/fileUtils";
import { determineSpecificFileType } from "@/utils/fileTypeUtils";
import { toast } from "sonner";
import { ImageRenderer, AudioRenderer, VideoRenderer, DocumentRenderer, GenericFileRenderer } from "./MediaTypeRenderer";
import { MediaGallery } from "./MediaGalleryGrid";
import { FileText, FileAudio, FileVideo, FileImage } from "lucide-react";

// Novo: layout responsivo flexível
function getGridColumns(count: number) {
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
  pdf: <FileText className="text-blue-700 w-8 h-8 mb-2" />,
  audio: <FileAudio className="text-pink-600 w-8 h-8 mb-2" />,
  video: <FileVideo className="text-violet-600 w-8 h-8 mb-2" />,
  image: <FileImage className="text-green-600 w-8 h-8 mb-2" />,
  word: <FileText className="text-sky-700 w-8 h-8 mb-2" />,
  excel: <FileText className="text-green-700 w-8 h-8 mb-2" />,
  code: <FileText className="text-gray-700 w-8 h-8 mb-2" />,
  zip: <FileText className="text-yellow-700 w-8 h-8 mb-2" />,
  presentation: <FileText className="text-orange-700 w-8 h-8 mb-2" />,
  file: <FileText className="text-gray-400 w-8 h-8 mb-2" />,
};

// Novo: Componente para placeholder visual de PDF e para outros tipos
const FileVisualPlaceholder = ({
  url,
  fileName,
  type,
}: {
  url: string;
  fileName: string;
  type: string;
}) => (
  <div className="flex flex-col items-center justify-center border p-3 rounded bg-gray-50 min-w-[120px] max-w-[160px] w-full">
    <div className="flex flex-col items-center">
      {fileTypeIcons[type] || fileTypeIcons.file}
      <span className="text-xs font-bold text-gray-600 truncate text-center">{fileName}</span>
    </div>
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs text-blue-500 underline mt-2"
      aria-label={`Abrir ${fileName}`}
    >
      Abrir arquivo
    </a>
  </div>
);

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

  // Se todos forem imagem (e mais que 1), galeria.
  const allImages = urls.every((u) => getFileType(u) === "image");
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

  // Grid para múltiplos tipos juntos
  return (
    <div className={`grid gap-2 ${getGridColumns(urls.length)}`}>
      {urls.map((url, index) => {
        const fileType = getFileType(url);
        const fileName = getFilenameFromUrl(url);
        const hasAnalysis = analysisResults && analysisResults[url];
        const extension = url.split(".").pop()?.toLowerCase() || "";
        const specificFileType = determineSpecificFileType(extension);

        // Verifica .webm de áudio (nova heurística para passar mediaType correto!)
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
              onOpenAnalysis={onOpenAnalysis}
              readOnly={readOnly}
              onDelete={onDelete}
              hasAnalysis={hasAnalysis}
              questionText={questionText}
              smallSize={smallSize}
            />
          );
        }

        // PDF placeholder visual (agora com ícone)
        if (specificFileType === "pdf") {
          return (
            <FileVisualPlaceholder key={url} url={url} fileName={fileName} type="pdf" />
          );
        }

        // Áudio: render com ícone (por consistência)
        if (fileType === "audio" || isWebmAudio) {
          return (
            <AudioRenderer
              key={url}
              url={url}
              index={index}
              fileName={fileName}
              onOpenPreview={onOpenPreview}
              // Passa mediaType='audio' explicitamente no callback!
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

        // Vídeo (inclui .webm sem heurística de áudio)
        if (
          fileType === "video" ||
          (isWebm && !isWebmAudio)
        ) {
          return (
            <VideoRenderer
              key={url}
              url={url}
              index={index}
              fileName={fileName}
              onOpenPreview={onOpenPreview}
              // Passa mediaType='video' explicitamente
              onOpenAnalysis={onOpenAnalysis}
              readOnly={readOnly}
              onDelete={onDelete}
              hasAnalysis={hasAnalysis}
              questionText={questionText}
              smallSize={smallSize}
            />
          );
        }

        // Outros tipos
        return (
          <FileVisualPlaceholder
            key={url}
            url={url}
            fileName={fileName}
            type={specificFileType}
          />
        );
      })}
    </div>
  );
}
