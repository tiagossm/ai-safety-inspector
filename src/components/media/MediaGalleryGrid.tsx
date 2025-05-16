// src/components/media/renderers/MediaGalleryGrid.tsx
import React from "react";

interface MediaGalleryGridProps {
  urls: string[];
  onImageClick?: (url: string, index: number) => void;
}

export const MediaGalleryGrid: React.FC<MediaGalleryGridProps> = ({
  urls,
  onImageClick,
}) => {
  if (!urls || urls.length === 0) return null;

  // Responsivo, até 5 colunas se tiver várias imagens
  const gridCols =
    urls.length === 1
      ? "grid-cols-1"
      : urls.length === 2
      ? "grid-cols-2"
      : urls.length <= 4
      ? "grid-cols-2 md:grid-cols-4"
      : urls.length <= 9
      ? "grid-cols-3 md:grid-cols-4"
      : "grid-cols-4 md:grid-cols-5";

  return (
    <div className={`grid gap-2 ${gridCols}`}>
      {urls.map((url, idx) => (
        <div
          key={url + idx}
          className="aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm cursor-pointer hover:scale-105 transition-transform bg-white flex items-center justify-center"
          onClick={() => onImageClick?.(url, idx)}
          style={{ maxWidth: 120, maxHeight: 120 }}
        >
          <img
            src={url}
            alt={`imagem ${idx + 1}`}
            className="object-cover w-full h-full"
            style={{
              minWidth: 0,
              minHeight: 0,
            }}
          />
        </div>
      ))}
    </div>
  );
};x