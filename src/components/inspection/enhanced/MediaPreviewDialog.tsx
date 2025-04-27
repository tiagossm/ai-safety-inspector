
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { File, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaPreviewDialogProps {
  previewUrl: string | null;
  onOpenChange: (open: boolean) => void;
}

export function MediaPreviewDialog({ previewUrl, onOpenChange }: MediaPreviewDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (!previewUrl) return null;

  const isImage = previewUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i);
  const isVideo = previewUrl.match(/\.(mp4|webm|ogg|mov)$/i);
  const isAudio = previewUrl.match(/\.(mp3|wav|ogg|m4a)$/i);
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = previewUrl.split('/').pop() || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={!!previewUrl} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Visualizar mídia</DialogTitle>
          <DialogDescription className="text-xs">
            {previewUrl.split('/').pop()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center justify-center p-4">
          {isImage ? (
            <img src={previewUrl} alt="Preview" className="max-h-[70vh] max-w-full object-contain" />
          ) : isVideo ? (
            <video src={previewUrl} controls className="max-h-[70vh] max-w-full" />
          ) : isAudio ? (
            <audio src={previewUrl} controls className="w-full" />
          ) : (
            <div className="p-8 text-center">
              <File className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p>Pré-visualização não disponível para este tipo de arquivo.</p>
              <a 
                href={previewUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary hover:underline mt-2 inline-block"
              >
                Abrir em nova janela
              </a>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <div></div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDownload}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
