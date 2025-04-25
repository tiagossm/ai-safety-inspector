
import React from "react";
import { Download, FileText, Mic, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaAttachmentsProps {
  mediaUrls: string[] | undefined;
  onDelete?: (url: string) => void;
}

export function MediaAttachments({ mediaUrls, onDelete }: MediaAttachmentsProps) {
  if (!mediaUrls || mediaUrls.length === 0) return null;
  
  return (
    <div className="mt-3 space-y-1.5">
      <h4 className="text-xs font-medium text-gray-600">Anexos ({mediaUrls.length})</h4>
      <div className="grid grid-cols-3 gap-2">
        {mediaUrls.map((url: string, i: number) => {
          const isImage = url.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i);
          const isVideo = url.match(/\.(mp4|webm|mov|avi)$/i);
          const isAudio = url.match(/\.(mp3|wav|ogg|m4a)$/i);
          
          return (
            <div key={i} className="relative aspect-square rounded border overflow-hidden group">
              {isImage ? (
                <img src={url} alt={`Mídia ${i+1}`} className="w-full h-full object-cover" />
              ) : isVideo ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
                  <Video className="h-5 w-5 text-gray-400" />
                  <span className="text-xs mt-1 text-gray-400">Vídeo</span>
                </div>
              ) : isAudio ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
                  <Mic className="h-5 w-5 text-gray-400" />
                  <span className="text-xs mt-1 text-gray-400">Áudio</span>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <span className="text-xs mt-1 text-gray-400">Arquivo</span>
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-1">
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="bg-white p-1 rounded-full shadow"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>
                  
                  {onDelete && (
                    <Button
                      onClick={() => onDelete(url)}
                      size="icon"
                      variant="destructive"
                      className="h-6 w-6 rounded-full p-1"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
