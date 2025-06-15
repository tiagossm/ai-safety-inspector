
import React from "react";

interface MediaCheckboxGridProps {
  files: string[];
  selected: string[];
  onToggle: (url: string) => void;
  disabled?: boolean;
}

// Utilitário para obter nome pequeno
const getSmallFilename = (url: string) => {
  try {
    const name = url.split("/").pop() || url;
    return name.length > 20 ? "..." + name.slice(-17) : name;
  } catch {
    return url;
  }
};

// Decide tipo pelo nome
const getType = (url: string) => {
  const ext = url.split('.').pop()?.toLowerCase() || "";
  if (["mp3", "wav", "ogg", "m4a", "webm"].includes(ext)) return "audio";
  if (["mp4", "mov", "avi"].includes(ext)) return "video";
  if (["jpg", "jpeg", "png", "webp", "gif", "bmp"].includes(ext)) return "image";
  if (["pdf"].includes(ext)) return "pdf";
  return "file";
};

export function MediaCheckboxGrid({ files, selected, onToggle, disabled }: MediaCheckboxGridProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {files.map((url, idx) => {
        const type = getType(url);

        return (
          <label 
            key={url}
            className={`relative flex flex-col cursor-pointer items-center p-2 border rounded transition-all ${selected.includes(url) ? "bg-primary/10 border-primary" : "bg-gray-50 border-gray-200"} ${disabled ? "opacity-60 pointer-events-none" : ""}`}
            style={{ width: 90, minHeight: 96 }}
          >
            <input
              type="checkbox"
              checked={selected.includes(url)}
              className="absolute left-1 top-1 accent-primary"
              onChange={() => onToggle(url)}
              disabled={disabled}
              tabIndex={0}
              aria-label={`Selecionar ${getSmallFilename(url)}`}
            />
            <div className="my-3">
              {type === "image" && (
                <img src={url} alt={`mídia ${idx+1}`} className="w-[54px] h-[54px] object-cover rounded" />
              )}
              {type === "audio" && (
                <span className="inline-block w-[54px] h-[54px] bg-pink-100 rounded flex items-center justify-center"><span role="img" aria-label="audio">🎵</span></span>
              )}
              {type === "video" && (
                <span className="inline-block w-[54px] h-[54px] bg-violet-100 rounded flex items-center justify-center"><span role="img" aria-label="vídeo">🎬</span></span>
              )}
              {type === "pdf" && (
                <span className="inline-block w-[54px] h-[54px] bg-sky-100 rounded flex items-center justify-center"><span role="img" aria-label="pdf">📄</span></span>
              )}
              {type === "file" && (
                <span className="inline-block w-[54px] h-[54px] bg-gray-200 rounded flex items-center justify-center"><span role="img" aria-label="arquivo">📁</span></span>
              )}
            </div>
            <span className="text-[10px] text-gray-700 text-center truncate max-w-[76px]">{getSmallFilename(url)}</span>
          </label>
        );
      })}
    </div>
  )
}
