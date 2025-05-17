
import React, { useState } from "react";
import { AlertTriangle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MediaGalleryProps {
  urls: string[];
  columns?: number; // número de colunas no grid (default: 4)
  maxThumbSize?: number; // tamanho máximo do quadrado da imagem (px, default: 96)
  analysisResults?: Record<string, any>; // Adicionada propriedade analysisResults
  onOpenPreview?: (url: string) => void;
  onOpenAnalysis?: (url: string, questionText?: string) => void;
  onDelete?: (url: string) => void;
  readOnly?: boolean;
  questionText?: string;
}

export function MediaGallery({
  urls,
  columns = 4,
  maxThumbSize = 96,
  analysisResults = {},
  onOpenPreview,
  onOpenAnalysis,
  onDelete,
  readOnly = false,
  questionText,
}: MediaGalleryProps) {
  const [modalUrl, setModalUrl] = useState<string | null>(null);

  const handleImageClick = (url: string) => {
    if (onOpenPreview) {
      onOpenPreview(url);
    } else {
      setModalUrl(url);
    }
  };

  const hasAnalysis = (url: string) => {
    return analysisResults && analysisResults[url];
  };

  const hasNonConformity = (url: string) => {
    return hasAnalysis(url) && analysisResults[url]?.hasNonConformity;
  };

  return (
    <div>
      {/* Grid de miniaturas */}
      <div
        className="media-gallery-grid"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gap: "12px",
        }}
      >
        {urls.map((url, idx) => (
          <div
            key={idx}
            className="media-gallery-thumb group relative"
            style={{
              width: `${maxThumbSize}px`,
              height: `${maxThumbSize}px`,
              background: "#f8fafc",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              overflow: "hidden",
              position: "relative",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "box-shadow 0.2s",
              boxShadow: "0 1px 3px 0 #00000012",
            }}
            onClick={() => handleImageClick(url)}
            title="Clique para ampliar"
          >
            {/* Badge de Análise */}
            {hasAnalysis(url) && (
              <div className="absolute top-1 right-1 z-10">
                {hasNonConformity(url) ? (
                  <Badge className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1" variant="outline">
                    <AlertTriangle className="h-3 w-3" />
                  </Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1" variant="outline">
                    <Sparkles className="h-3 w-3" />
                  </Badge>
                )}
              </div>
            )}

            {/* Imagem */}
            <img
              src={url}
              alt={`Mídia ${idx + 1}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                transition: "transform 0.15s",
              }}
              className="media-thumb-img"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iNiIgZmlsbD0iI2Y2ZjZmNiIvPjxwYXRoIGQ9Ik0yNSA1NEwzNSA1M0wzNSA0MUwyNSA0MCIgc3Ryb2tlPSIjZTJlMmUyIiBzdHJva2Utd2lkdGg9IjQiLz48L3N2Zz4=";
              }}
            />

            {/* Controles de ação */}
            {!readOnly && (
              <div 
                className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-1 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {onOpenAnalysis && (
                  <button 
                    className="text-white text-xs px-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAnalysis(url, questionText);
                    }}
                  >
                    <Sparkles className="h-3 w-3" />
                  </button>
                )}
                
                {onDelete && (
                  <button 
                    className="text-white text-xs px-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(url);
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            )}

            {/* Hover effect */}
            <div
              className="media-thumb-hover absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-medium transition-opacity"
            >
              Ampliar
            </div>
          </div>
        ))}
      </div>

      {/* Modal de visualização */}
      {modalUrl && (
        <div
          className="media-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          onClick={() => setModalUrl(null)}
        >
          <img
            src={modalUrl}
            alt="Imagem ampliada"
            className="max-w-[90vw] max-h-[90vh] rounded-lg bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
