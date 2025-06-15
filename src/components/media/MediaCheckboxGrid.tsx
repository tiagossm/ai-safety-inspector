
import React from "react";
import { getFilenameFromUrl } from "@/utils/fileUtils";
import { Trash2 } from "lucide-react";

interface MediaCheckboxGridProps {
  files: string[];
  selected: string[];
  onToggle: (url: string) => void;
  disabled?: boolean;
  onDeleteFile?: (url: string) => void; // NOVO!
}

// Decide tipo pelo nome
const getType = (url: string) => {
  const ext = url.split('.').pop()?.toLowerCase() || "";
  if (["mp3", "wav", "ogg", "m4a", "webm"].includes(ext)) return "audio";
  if (["mp4", "mov", "avi"].includes(ext)) return "video";
  if (["jpg", "jpeg", "png", "webp", "gif", "bmp"].includes(ext)) return "image";
  if (["pdf"].includes(ext)) return "pdf";
  return "file";
};

export function MediaCheckboxGrid({ files, selected, onToggle, disabled, onDeleteFile }: MediaCheckboxGridProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {files.map((url, idx) => {
        const type = getType(url);
        const realFilename = getFilenameFromUrl(url);

        return (
          <label 
            key={url}
            className={`relative flex flex-col cursor-pointer items-center p-2 border rounded transition-all ${selected.includes(url) ? "bg-primary/10 border-primary" : "bg-gray-50 border-gray-200"} ${disabled ? "opacity-60 pointer-events-none" : ""}`}
            style={{ width: 128, minHeight: 112, maxWidth: 136 }}
            title={realFilename}
          >
            <input
              type="checkbox"
              checked={selected.includes(url)}
              className="absolute left-1 top-1 accent-primary"
              onChange={() => onToggle(url)}
              disabled={disabled}
              tabIndex={0}
              aria-label={`Selecionar ${realFilename}`}
              style={{ zIndex: 1 }}
            />
            {/* Botão de excluir */}
            {onDeleteFile && !disabled && (
              <button
                type="button"
                className="absolute right-1 top-1 p-0.5 rounded hover:bg-red-50"
                aria-label={`Excluir ${realFilename}`}
                title="Remover da lista"
                tabIndex={0}
                style={{ zIndex: 2 }}
                onClick={e => { 
                  e.stopPropagation(); 
                  e.preventDefault(); 
                  onDeleteFile(url);
                }}
              >
                <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
              </button>
            )}
            <div className="my-3">
              {type === "image" && (
                <img src={url} alt={`mídia ${idx+1}`} className="w-[64px] h-[64px] object-cover rounded" />
              )}
              {type === "audio" && (
                <span className="inline-block w-[64px] h-[64px] bg-pink-100 rounded flex items-center justify-center">
                  <span role="img" aria-label="audio">🎵</span>
                </span>
              )}
              {type === "video" && (
                <span className="inline-block w-[64px] h-[64px] bg-violet-100 rounded flex items-center justify-center">
                  <span role="img" aria-label="vídeo">🎬</span>
                </span>
              )}
              {type === "pdf" && (
                <span className="inline-block w-[64px] h-[64px] bg-sky-100 rounded flex items-center justify-center">
                  <span role="img" aria-label="pdf">📄</span>
                </span>
              )}
              {type === "file" && (
                <span className="inline-block w-[64px] h-[64px] bg-gray-200 rounded flex items-center justify-center">
                  <span role="img" aria-label="arquivo">📁</span>
                </span>
              )}
            </div>
            <span
              className="text-[11px] text-gray-700 text-center truncate max-w-[110px] leading-snug"
              style={{
                wordBreak: "break-all",
                // Limitar a 2 linhas, mostra '...' ao exceder
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                minHeight: "2.3em",
              }}
              title={realFilename}
            >
              {realFilename}
            </span>
          </label>
        );
      })}
    </div>
  )
}
