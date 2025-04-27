
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { File, Video, Mic, Image } from "lucide-react";

interface MediaPreviewDialogProps {
  previewUrl: string | null;
  onOpenChange: (open: boolean) => void;
}

export function MediaPreviewDialog({ previewUrl, onOpenChange }: MediaPreviewDialogProps) {
  if (!previewUrl) return null;
  
  // Determine media type
  const isImage = previewUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) !== null;
  const isVideo = previewUrl.match(/\.(mp4|webm|mov|ogg|avi)$/i) !== null;
  const isAudio = previewUrl.match(/\.(mp3|wav|ogg|m4a|webm)$/i) !== null;
  
  // Get the file name from the URL
  const fileName = previewUrl.split('/').pop() || "Arquivo";

  return (
    <Dialog open={!!previewUrl} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{fileName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center">
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
              <a
                href={previewUrl}
                download={fileName}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
              >
                Baixar arquivo
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
