import React, { useState } from "react";

interface MediaGalleryProps {
  urls: string[];
  columns?: number; // número de colunas no grid (default: 4)
  maxThumbSize?: number; // tamanho máximo do quadrado da imagem (px, default: 96)
}

export function MediaGallery({
  urls,
  columns = 4,
  maxThumbSize = 96,
}: MediaGalleryProps) {
  const [modalUrl, setModalUrl] = useState<string | null>(null);

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
            className="media-gallery-thumb group"
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
            onClick={() => setModalUrl(url)}
            title="Clique para ampliar"
          >
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
            {/* Hover effect */}
            <div
              className="media-thumb-hover"
              style={{
                display: "none",
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0,0,0,0.16)",
                color: "#fff",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
                zIndex: 2,
              }}
            >
              Ampliar
            </div>
          </div>
        ))}
      </div>

      {/* Modal de visualização */}
      {modalUrl && (
        <div
          className="media-modal-backdrop"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
          onClick={() => setModalUrl(null)}
        >
          <img
            src={modalUrl}
            alt="Imagem ampliada"
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              borderRadius: "10px",
              background: "#fff",
              boxShadow: "0 4px 32px 0 #00000050",
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
