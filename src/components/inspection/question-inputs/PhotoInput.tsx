
import React from "react";
import { MediaCaptureMenu } from "./MediaCaptureMenu";

interface PhotoInputProps {
  onAddMedia: () => void;
  mediaUrls: string[] | undefined;
}

export function PhotoInput({ onAddMedia, mediaUrls }: PhotoInputProps) {
  return (
    <div className="mt-2">
      <MediaCaptureMenu 
        onAddMedia={onAddMedia}
        mediaUrls={mediaUrls}
      />
      
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
