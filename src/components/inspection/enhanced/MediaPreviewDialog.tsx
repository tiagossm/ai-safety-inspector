
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { File } from "lucide-react";

interface MediaPreviewDialogProps {
  previewUrl: string | null;
  onOpenChange: (open: boolean) => void;
}

export function MediaPreviewDialog({ previewUrl, onOpenChange }: MediaPreviewDialogProps) {
  if (!previewUrl) return null;

  return (
    <Dialog open={!!previewUrl} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Pré-visualização</DialogTitle>
        </DialogHeader>
        
        <div className="flex items-center justify-center p-4">
          {previewUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
            <img src={previewUrl} alt="Preview" className="max-h-[70vh] max-w-full object-contain" />
          ) : previewUrl.match(/\.(mp4|webm|ogg)$/i) ? (
            <video src={previewUrl} controls className="max-h-[70vh] max-w-full" />
          ) : previewUrl.match(/\.(mp3|wav|webm)$/i) ? (
            <audio src={previewUrl} controls className="w-full" />
          ) : (
            <div className="p-8 text-center">
              <File className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p>Pré-visualização não disponível para este tipo de arquivo.</p>
              <a 
                href={previewUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline mt-2 inline-block"
              >
                Abrir em nova janela
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
