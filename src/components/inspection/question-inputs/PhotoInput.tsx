
import React from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

interface PhotoInputProps {
  onAddMedia: () => void;
  mediaUrls: string[] | undefined;
}

export function PhotoInput({ onAddMedia, mediaUrls }: PhotoInputProps) {
  return (
    <div className="mt-2">
      <Button 
        variant="outline" 
        className="flex items-center gap-2 text-xs"
        size="sm"
        onClick={onAddMedia}
      >
        <Camera className="h-3.5 w-3.5" />
        <span>Adicionar Foto</span>
      </Button>
      
      {mediaUrls && mediaUrls.length > 0 && (
        <div className="mt-2 grid grid-cols-3 gap-2">
          {mediaUrls.map((url: string, i: number) => (
            <div key={i} className="relative aspect-square rounded border overflow-hidden">
              <img 
                src={url} 
                alt={`Mídia ${i+1}`} 
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
