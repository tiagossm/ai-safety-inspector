
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { File, Video, Mic, Image, ChevronLeft, ChevronRight, Download } from "lucide-react";

interface MediaPreviewDialogProps {
  previewUrl: string | null;
  onOpenChange: (open: boolean) => void;
  mediaUrls?: string[];
}

export function MediaPreviewDialog({ 
  previewUrl, 
  onOpenChange,
  mediaUrls = []
}: MediaPreviewDialogProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  if (!previewUrl) return null;
  
  // Find the index of the current preview URL in the media URLs array
  const urlIndex = mediaUrls.indexOf(previewUrl);
  if (urlIndex >= 0 && currentIndex !== urlIndex) {
    setCurrentIndex(urlIndex);
  }
  
  // Determine media type
  const isImage = previewUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) !== null;
  const isVideo = previewUrl.match(/\.(mp4|webm|mov|ogg|avi)$/i) !== null;
  const isAudio = previewUrl.match(/\.(mp3|wav|ogg|m4a|webm)$/i) !== null;
  
  // Get the file name from the URL
  const fileName = previewUrl.split('/').pop() || "Arquivo";
  
  // Navigation handlers
  const handlePrevious = () => {
    if (mediaUrls.length > 1) {
      const newIndex = currentIndex > 0 ? currentIndex - 1 : mediaUrls.length - 1;
      setCurrentIndex(newIndex);
      // Update the preview URL by calling onOpenChange with false and then true
      const newUrl = mediaUrls[newIndex];
      onOpenChange(false);
      setTimeout(() => onOpenChange(true), 0);
    }
  };
  
  const handleNext = () => {
    if (mediaUrls.length > 1) {
      const newIndex = currentIndex < mediaUrls.length - 1 ? currentIndex + 1 : 0;
      setCurrentIndex(newIndex);
      // Update the preview URL
      const newUrl = mediaUrls[newIndex];
      onOpenChange(false);
      setTimeout(() => onOpenChange(true), 0);
    }
  };
  
  const handleDownload = () => {
    if (previewUrl) {
      const link = document.createElement('a');
      link.href = previewUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Dialog open={!!previewUrl} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{fileName}</span>
            <div className="flex items-center gap-2">
              {mediaUrls.length > 1 && (
                <span className="text-sm text-muted-foreground">
                  {currentIndex + 1} / {mediaUrls.length}
                </span>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center relative">
          {mediaUrls.length > 1 && (
            <>
              <Button 
                variant="outline" 
                size="icon" 
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10"
                onClick={handleNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        
          {isImage && (
            <img
              src={previewUrl}
              alt="Visualização"
              className="max-h-[70vh] max-w-full object-contain rounded-md"
            />
          )}
          
          {isVideo && (
            <video
              src={previewUrl}
              controls
              className="max-h-[70vh] max-w-full rounded-md"
            >
              Seu navegador não suporta a reprodução de vídeos.
            </video>
          )}
          
          {isAudio && (
            <div className="w-full max-w-md p-4 bg-muted rounded-md">
              <Mic className="h-8 w-8 mx-auto mb-4 text-primary" />
              <audio
                src={previewUrl}
                controls
                className="w-full"
              >
                Seu navegador não suporta a reprodução de áudio.
              </audio>
            </div>
          )}
          
          {!isImage && !isVideo && !isAudio && (
            <div className="flex flex-col items-center justify-center p-8">
              <File className="h-16 w-16 mb-4 text-primary" />
              <p className="text-center mb-4">
                Este tipo de arquivo não pode ser visualizado diretamente.
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleDownload}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span>Baixar</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
