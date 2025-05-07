
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Download, ZoomIn, RotateCw, ExternalLink, X } from 'lucide-react';
import { getFileType, getFilenameFromUrl } from '@/utils/fileUtils';
import { toast } from 'sonner';

interface MediaPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string | null;
  title?: string;
}

export function MediaPreviewDialog({ 
  open, 
  onOpenChange, 
  url, 
  title 
}: MediaPreviewDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  
  useEffect(() => {
    if (open && url) {
      setIsLoading(true);
      setZoomLevel(1);
      setRotation(0);
    }
  }, [open, url]);
  
  if (!url) return null;
  
  const fileType = getFileType(url);
  const fileName = title || getFilenameFromUrl(url);
  
  const handleDownload = () => {
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      toast.error('Não foi possível fazer o download do arquivo');
    }
  };
  
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  
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
            src={url} 
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
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4 mr-1" /> Aproximar
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomIn className="h-4 w-4 mr-1 rotate-180" /> Afastar
          </Button>
          <Button variant="outline" size="sm" onClick={handleRotate}>
            <RotateCw className="h-4 w-4 mr-1" /> Girar
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-1" /> Baixar
          </Button>
        </div>
      </div>
    );
  } else if (fileType === 'video') {
    content = (
      <div className="flex flex-col items-center">
        <div className="relative w-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          <video 
            src={url} 
            controls 
            className="w-full max-h-[70vh]" 
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
          onClick={handleDownload}
          className="mt-4"
        >
          <Download className="h-4 w-4 mr-1" /> Baixar
        </Button>
      </div>
    );
  } else if (fileType === 'audio') {
    content = (
      <div className="flex flex-col items-center p-4 w-full">
        <div className="w-full bg-gray-50 rounded-lg p-6">
          <div className="mb-6 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="font-medium">{fileName}</p>
          </div>
          <div className={`rounded-lg p-3 ${isLoading ? 'opacity-50' : ''}`}>
            <audio 
              src={url} 
              controls 
              autoPlay={false}
              className="w-full" 
              onLoadedData={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                toast.error('Não foi possível carregar o áudio');
              }}
            />
          </div>
          <div className="mt-4 flex justify-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-1" /> Baixar Áudio
            </Button>
          </div>
        </div>
      </div>
    );
  } else {
    // Verificar se é um PDF específicamente pela extensão
    const extension = url.split('.').pop()?.toLowerCase() || '';
    const isPdf = extension === 'pdf';
    
    if (isPdf) {
      content = (
        <div className="flex flex-col h-[70vh]">
          <iframe 
            src={`${url}#toolbar=0&navpanes=0`}
            title={fileName}
            className="w-full h-full border-0"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              toast.error('Não foi possível carregar o PDF');
            }}
          />
          <div className="flex justify-center space-x-2 mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-1" /> Baixar
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.open(url, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-1" /> Abrir em Nova Aba
            </Button>
          </div>
        </div>
      );
    } else {
      content = (
        <div className="flex flex-col items-center justify-center p-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Visualização não disponível</h3>
          <p className="text-gray-500 mb-6 text-center">Este tipo de arquivo não pode ser visualizado diretamente no navegador.</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" /> Baixar Arquivo
            </Button>
            <Button variant="outline" onClick={() => window.open(url, '_blank')}>
              <ExternalLink className="h-4 w-4 mr-1" /> Abrir em Nova Aba
            </Button>
          </div>
        </div>
      );
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="truncate max-w-[85%]">{fileName}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        {isLoading && fileType !== 'image' && fileType !== 'video' && fileType !== 'audio' && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        {content}
      </DialogContent>
    </Dialog>
  );
}
