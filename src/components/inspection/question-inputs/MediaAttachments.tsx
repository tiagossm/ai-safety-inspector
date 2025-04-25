
import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface MediaAttachmentsProps {
  mediaUrls: string[];
  onDelete?: (urlToDelete: string) => void;
}

export function MediaAttachments({ mediaUrls, onDelete }: MediaAttachmentsProps) {
  if (!mediaUrls || mediaUrls.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
      {mediaUrls.map((url, index) => {
        const isImage = url.match(/\.(jpeg|jpg|gif|png|webp)$/i);
        
        return (
          <div key={index} className="relative group">
            {isImage ? (
              <img 
                src={url} 
                alt={`Media ${index + 1}`}
                className="h-24 w-full object-cover rounded-md border border-gray-200"
              />
            ) : (
              <div className="h-24 w-full bg-gray-100 flex items-center justify-center rounded-md border border-gray-200">
                <span className="text-xs text-gray-500 truncate px-2">
                  {url.split('/').pop()}
                </span>
              </div>
            )}
            
            {onDelete && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onDelete(url)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
