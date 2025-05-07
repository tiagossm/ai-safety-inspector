
import React, { useState } from "react";
import { X, ExternalLink, PlayCircle, PauseCircle, ZoomIn, Download, RotateCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFileType, formatFileSize, getFilenameFromUrl, getFileIcon } from "@/utils/fileUtils";
import { MediaPreviewDialog } from "@/components/media/MediaPreviewDialog";
import { MediaAnalysisDialog } from "@/components/media/MediaAnalysisDialog";
import { toast } from "sonner";

interface MediaAttachmentsProps {
  mediaUrls: string[];
  onDelete?: (url: string) => void;
  readOnly?: boolean;
}

export function MediaAttachments({ mediaUrls, onDelete, readOnly = false }: MediaAttachmentsProps) {
  const [activePreviewUrl, setActivePreviewUrl] = useState<string | null>(null);
  const [activeAnalysisUrl, setActiveAnalysisUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleOpenPreview = (url: string) => {
    setActivePreviewUrl(url);
  };

  const handleOpenAnalysis = (url: string) => {
    setActiveAnalysisUrl(url);
  };

  const toggleAudioPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

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

  const renderAttachment = (url: string, index: number) => {
    const fileType = getFileType(url);
    const IconComponent = getFileIcon(fileType);
    const fileName = getFilenameFromUrl(url);
    
    // Lidar com imagens
    if (fileType === 'image') {
      return (
        <div key={index} className="relative group">
          <div 
            className="border rounded-md overflow-hidden cursor-pointer" 
            onClick={() => handleOpenPreview(url)}
          >
            <img 
              src={url} 
              alt={`Anexo ${index + 1}`} 
              className="h-40 w-full object-cover"
            />
          </div>
          <div className="absolute bottom-1 left-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              size="icon"
              className="h-6 w-6 rounded-full bg-white/80 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenAnalysis(url);
              }}
            >
              <Sparkles className="h-3 w-3 text-amber-500" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-6 w-6 rounded-full bg-white/80 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenPreview(url);
              }}
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
          </div>
          {!readOnly && onDelete && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(url);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    }
    
    // Lidar com áudio
    if (fileType === 'audio') {
      return (
        <div key={index} className="relative group">
          <div className="border rounded-md p-3 flex items-center gap-3 bg-slate-50">
            <IconComponent className="h-6 w-6 text-primary" />
            <div className="flex-1 mr-2 overflow-hidden">
              <p className="text-sm font-medium truncate">{fileName}</p>
              <div className="flex items-center mt-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 p-0 hover:bg-transparent"
                  onClick={() => handleOpenPreview(url)}
                >
                  <PlayCircle className="h-6 w-6 text-primary" />
                </Button>
                <div className="h-1.5 flex-1 mx-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-0"></div>
                </div>
                <span className="text-xs text-gray-500">0:00</span>
              </div>
            </div>
            <div className="flex">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenAnalysis(url);
                }}
              >
                <Sparkles className="h-3 w-3 text-amber-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleDownload(url, fileName)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {!readOnly && onDelete && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onDelete(url)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    }
    
    // Lidar com vídeo
    if (fileType === 'video') {
      return (
        <div key={index} className="relative group">
          <div 
            className="border rounded-md overflow-hidden cursor-pointer bg-gray-100 h-40 flex items-center justify-center" 
            onClick={() => handleOpenPreview(url)}
          >
            <PlayCircle className="h-12 w-12 text-primary opacity-80" />
          </div>
          <p className="text-xs font-medium mt-1 truncate">{fileName}</p>
          <div className="absolute bottom-6 left-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              size="icon"
              className="h-6 w-6 rounded-full bg-white/80 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenAnalysis(url);
              }}
            >
              <Sparkles className="h-3 w-3 text-amber-500" />
            </Button>
          </div>
          {!readOnly && onDelete && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(url);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    }
    
    // Para os demais tipos de arquivo, precisamos identificar tipos específicos por extensão
    const extension = url.split('.').pop()?.toLowerCase() || '';
    const specificFileType = 
      /pdf$/.test(extension) ? 'pdf' :
      /(xlsx|xls|csv|numbers)$/.test(extension) ? 'excel' :
      /(docx|doc|odt)$/.test(extension) ? 'word' :
      /(js|ts|py|java|html|css|php|rb|go)$/.test(extension) ? 'code' :
      /(zip|rar|tar|gz|7z)$/.test(extension) ? 'zip' :
      /(ppt|pptx|key|odp)$/.test(extension) ? 'presentation' :
      'generic';
    
    // Lidar com PDF usando a variável specificFileType
    if (specificFileType === 'pdf') {
      return (
        <div key={index} className="relative group">
          <div className="border rounded-md p-3 flex items-center gap-3">
            <IconComponent className="h-6 w-6 text-red-500" />
            <div className="flex-1">
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-medium truncate flex-1 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {fileName}
              </a>
              <p className="text-xs text-gray-500">
                Documento PDF
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleOpenPreview(url)}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          {!readOnly && onDelete && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onDelete(url)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    }
    
    // Lidar com outros tipos de arquivo
    return (
      <div key={index} className="relative group">
        <div className="border rounded-md p-3 flex items-center gap-3">
          <IconComponent className="h-6 w-6 text-primary" />
          <div className="flex-1">
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-medium truncate flex-1 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {fileName}
            </a>
            <p className="text-xs text-gray-500">
              {specificFileType === 'excel' ? 'Planilha Excel' :
               specificFileType === 'word' ? 'Documento Word' :
               specificFileType === 'code' ? 'Arquivo de Código' :
               specificFileType === 'zip' ? 'Arquivo Compactado' :
               specificFileType === 'presentation' ? 'Apresentação' :
               'Documento'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleDownload(url, fileName)}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
        {!readOnly && onDelete && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onDelete(url)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };
  
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {mediaUrls.map((url, index) => renderAttachment(url, index))}
      </div>
      
      <MediaPreviewDialog 
        open={!!activePreviewUrl}
        onOpenChange={() => setActivePreviewUrl(null)}
        url={activePreviewUrl}
      />
      
      <MediaAnalysisDialog 
        open={!!activeAnalysisUrl}
        onOpenChange={() => setActiveAnalysisUrl(null)}
        mediaUrl={activeAnalysisUrl}
      />
    </>
  );
}
