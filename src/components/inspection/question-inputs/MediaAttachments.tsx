
import React, { useState } from "react";
import { X, ExternalLink, PlayCircle, PauseCircle, ZoomIn, Download, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFileIcon, getFileType, formatFileSize, getFilenameFromUrl } from "@/utils/fileUtils";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface MediaAttachmentsProps {
  mediaUrls: string[];
  onDelete?: (url: string) => void;
  readOnly?: boolean;
}

export function MediaAttachments({ mediaUrls, onDelete, readOnly = false }: MediaAttachmentsProps) {
  const [activeDialogUrl, setActiveDialogUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleOpenDialog = (url: string) => {
    setActiveDialogUrl(url);
    setZoomLevel(1);
    setRotation(0);
    setIsLoading(true);
  };

  const handleCloseDialog = () => {
    setActiveDialogUrl(null);
    setIsPlaying(false);
    setZoomLevel(1);
    setRotation(0);
  };

  const toggleAudioPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };
  
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

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
      console.error('Download error:', error);
    }
  };

  const renderAttachment = (url: string, index: number) => {
    const fileType = getFileType(url);
    const FileIcon = getFileIcon(fileType);
    const fileName = getFilenameFromUrl(url);
    
    // Handle images
    if (fileType === 'image') {
      return (
        <div key={index} className="relative group">
          <div 
            className="border rounded-md overflow-hidden cursor-pointer" 
            onClick={() => handleOpenDialog(url)}
          >
            <img 
              src={url} 
              alt={`Anexo ${index + 1}`} 
              className="h-40 w-full object-cover"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                toast.error(`Não foi possível carregar a imagem: ${fileName}`);
              }}
            />
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
          <Button
            variant="secondary"
            size="icon"
            className="absolute bottom-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => handleOpenDialog(url)}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      );
    }
    
    // Handle audio
    if (fileType === 'audio') {
      return (
        <div key={index} className="relative group">
          <div className="border rounded-md p-3 flex items-center gap-3 bg-slate-50">
            <FileIcon className="h-6 w-6 text-primary" />
            <div className="flex-1 mr-2 overflow-hidden">
              <p className="text-sm font-medium truncate">{fileName}</p>
              <div className="flex items-center mt-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 p-0 hover:bg-transparent"
                  onClick={toggleAudioPlay}
                >
                  {isPlaying ? (
                    <PauseCircle className="h-6 w-6 text-primary" />
                  ) : (
                    <PlayCircle className="h-6 w-6 text-primary" />
                  )}
                </Button>
                <div className="h-1.5 flex-1 mx-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-0"></div>
                </div>
                <span className="text-xs text-gray-500">0:00</span>
              </div>
              {isPlaying && <audio src={url} autoPlay controls hidden />}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
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
    }
    
    // Handle video
    if (fileType === 'video') {
      return (
        <div key={index} className="relative group">
          <div 
            className="border rounded-md overflow-hidden cursor-pointer bg-gray-100 h-40 flex items-center justify-center" 
            onClick={() => handleOpenDialog(url)}
          >
            <PlayCircle className="h-12 w-12 text-primary opacity-80" />
          </div>
          <p className="text-xs font-medium mt-1 truncate">{fileName}</p>
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
    
    // Handle PDF
    if (fileType === 'pdf') {
      return (
        <div key={index} className="relative group">
          <div className="border rounded-md p-3 flex items-center gap-3">
            <FileIcon className="h-6 w-6 text-red-500" />
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
                PDF Document
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleOpenDialog(url)}
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
    
    // Handle other file types
    return (
      <div key={index} className="relative group">
        <div className="border rounded-md p-3 flex items-center gap-3">
          <FileIcon className="h-6 w-6 text-primary" />
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
              {fileType === 'excel' ? 'Excel Spreadsheet' :
                fileType === 'word' ? 'Word Document' :
                fileType === 'code' ? 'Code File' :
                fileType === 'zip' ? 'Archive File' :
                fileType === 'presentation' ? 'Presentation' :
                'Document'}
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

  const renderMediaDialog = () => {
    if (!activeDialogUrl) return null;
    
    const fileType = getFileType(activeDialogUrl);
    const fileName = getFilenameFromUrl(activeDialogUrl);
    
    let content;
    
    if (fileType === 'image') {
      content = (
        <div className="flex flex-col items-center">
          <div className="relative max-h-[70vh] overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            <img 
              src={activeDialogUrl} 
              alt={fileName} 
              className="max-h-[60vh] max-w-full object-contain transition-transform duration-200"
              style={{ 
                transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                transformOrigin: 'center'
              }}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                toast.error('Não foi possível carregar a imagem');
              }}
            />
          </div>
          <div className="flex space-x-2 mt-4">
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4 mr-1" /> Aproximar
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomIn className="h-4 w-4 mr-1 rotate-180" /> Afastar
            </Button>
            <Button variant="outline" size="sm" onClick={handleRotate}>
              <RotateCw className="h-4 w-4 mr-1" /> Girar
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleDownload(activeDialogUrl, fileName)}
            >
              <Download className="h-4 w-4 mr-1" /> Baixar
            </Button>
          </div>
        </div>
      );
    } else if (fileType === 'video') {
      content = (
        <div className="flex flex-col items-center">
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            <video 
              src={activeDialogUrl} 
              controls 
              className="max-h-[70vh] max-w-full" 
              autoPlay
              onLoadedData={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                toast.error('Não foi possível carregar o vídeo');
              }}
            />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDownload(activeDialogUrl, fileName)}
            className="mt-4"
          >
            <Download className="h-4 w-4 mr-1" /> Baixar
          </Button>
        </div>
      );
    } else if (fileType === 'audio') {
      content = (
        <div className="flex flex-col items-center p-4">
          <div className="w-full max-w-md bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-center mb-4">
              <FileIcon className="h-16 w-16 text-primary" />
            </div>
            <p className="text-center mb-4">{fileName}</p>
            <audio 
              src={activeDialogUrl} 
              controls 
              autoPlay 
              className="w-full" 
              onLoadedData={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                toast.error('Não foi possível carregar o áudio');
              }}
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleDownload(activeDialogUrl, fileName)}
              className="mt-4 w-full"
            >
              <Download className="h-4 w-4 mr-1" /> Baixar
            </Button>
          </div>
        </div>
      );
    } else if (fileType === 'pdf') {
      content = (
        <div className="flex flex-col items-center h-[70vh]">
          <iframe 
            src={`${activeDialogUrl}#toolbar=0&navpanes=0`}
            title={fileName}
            className="w-full h-full border-0"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              toast.error('Não foi possível carregar o PDF');
            }}
          />
          <div className="flex space-x-2 mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleDownload(activeDialogUrl, fileName)}
            >
              <Download className="h-4 w-4 mr-1" /> Baixar
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.open(activeDialogUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-1" /> Abrir em Nova Aba
            </Button>
          </div>
        </div>
      );
    } else {
      content = (
        <div className="flex flex-col items-center justify-center p-4">
          <FileIcon className="h-16 w-16 text-primary mb-4" />
          <p className="text-lg font-medium mb-2">Visualização não disponível</p>
          <p className="text-gray-500 mb-4">Por favor, baixe o arquivo para visualizá-lo.</p>
          <div className="flex space-x-2">
            <Button 
              variant="default" 
              onClick={() => handleDownload(activeDialogUrl, fileName)}
            >
              <Download className="mr-2 h-4 w-4" />
              Baixar Arquivo
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.open(activeDialogUrl, '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir Arquivo
            </Button>
          </div>
        </div>
      );
    }
    
    return (
      <Dialog open={!!activeDialogUrl} onOpenChange={() => handleCloseDialog()}>
        <DialogContent className="max-w-4xl w-[90vw]">
          <DialogHeader>
            <DialogTitle className="text-center">
              {fileName}
            </DialogTitle>
          </DialogHeader>
          {isLoading && fileType !== 'image' && fileType !== 'video' && fileType !== 'audio' && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          {content}
        </DialogContent>
      </Dialog>
    );
  };
  
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {mediaUrls.map((url, index) => renderAttachment(url, index))}
      </div>
      {renderMediaDialog()}
    </>
  );
}
